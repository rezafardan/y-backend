// ORM
import prisma from "../models/prisma";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

// MODE DEPLOY (production / local) — lihat src/config/deployMode.ts
import { isProductionMode } from "../config/deployMode";

const Login = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET BODY
    const { username, password } = req.body;

    // USERNAME AND PASSWORD VALIDATION
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // DATABASE CONNECTION
    const result = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        role: true,
        passwordHash: true,
        profileImage: true,
        deletedAt: true,
      },
    });

    if (!result) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // PASSWORD VALIDATION
    if (!result || !result.passwordHash) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const passwordCompare = await bcrypt.compare(password, result.passwordHash);
    if (!passwordCompare) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // USER ACTIVE OR INACTIVE VALIDATION
    if (result.deletedAt !== null) {
      return res
        .status(403)
        .json({ message: "User is inactive or does not exist." });
    }

    // CREATE TOKEN JWT
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

    if (!ACCESS_TOKEN_SECRET) {
      return res
        .status(500)
        .json({ message: "Server error: please contact an administrator" }); // JWT secret is not set
    }

    const accessToken = jwt.sign(
      {
        id: result.id,
        username: result.username,
        role: result.role,
        deletedAt: result.deletedAt,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // SEND RESPONSE HTTP COOKIES FOR TOKEN VALIDATION
    // Secure+SameSite=None HANYA dipakai di mode production (di belakang
    // HTTPS/Caddy) — kalau dipaksa aktif saat testing lokal (HTTP biasa),
    // browser akan menolak simpan cookie ini dan login akan gagal diam-diam.
    // Mode local pakai Lax+non-secure supaya tetap jalan di http://localhost.
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProductionMode,
      sameSite: isProductionMode ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day (in milliseconds)
    });

    return res.status(200).json({
      redirect: "/",
      message: `Login success, Welcome ${result.username}`,
      user: {
        id: result.id,
        username: result.username,
        role: result.role,
        profileImage: result.profileImage,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error when trying to login", error });
  }
};

const Logout = async (req: Request, res: Response): Promise<any> => {
  try {
    // Clear cookies — atributnya harus sama persis dengan saat di-set (Login)
    // di atas, kalau tidak, browser tidak akan menganggapnya cookie yang sama.
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProductionMode,
      sameSite: isProductionMode ? "none" : "lax",
    });

    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error during logout", error });
  }
};

const authCheck = async (req: Request, res: Response): Promise<any> => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

    if (!ACCESS_TOKEN_SECRET) {
      return res.status(500).json({
        message: "Server error: please contact an administrator",
      });
    }

    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as {
      id: string;
      username: string;
      role: string;
      deletedAt: Date | null;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
        profileImage: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt !== null) {
      return res.status(401).json({
        message: "User is inactive or does not exist",
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error checking authentication status",
      error,
    });
  }
};

export default { Login, Logout, authCheck };
