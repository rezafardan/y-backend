import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../models/prisma";

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
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only true for production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "None" for cross-site cookies, "Lax" for same-site
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
    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error during logout", error });
  }
};

const ResetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, newPassword } = req.body;

    // Validasi input
    if (!username || !newPassword) {
      return res
        .status(400)
        .json({ message: "Username and new password are required" });
    }

    // Cari pengguna berdasarkan username
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash password baru
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await prisma.user.update({
      where: { username },
      data: { passwordHash },
    });

    return res
      .status(200)
      .json({ message: "Password has been updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error when trying to reset password", error });
  }
};

export default { Login, Logout, ResetPassword };
