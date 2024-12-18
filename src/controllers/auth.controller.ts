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
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
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
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: result.id,
        username: result.username,
        role: result.role,
        deletedAt: result.deletedAt,
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Update user with new refresh token
    await prisma.user.update({
      where: { id: result.id },
      data: {
        refreshToken: refreshToken,
        refreshTokenExpiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    // SEND RESPONSE HTTP COOKIES FOR TOKEN VALIDATION
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
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

const RefreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token found" });
    }

    // CREATE TOKEN JWT
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
      return res
        .status(500)
        .json({ message: "Server error: please contact an administrator" }); // JWT secret is not set
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      id: string;
      username: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
        refreshToken: refreshToken,
        refreshTokenExpiredAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const Logout = async (req: Request, res: Response): Promise<any> => {
  try {
    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

export default { Login, RefreshToken, Logout, ResetPassword };
