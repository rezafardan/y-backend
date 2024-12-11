import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma";

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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res
        .status(500)
        .json({ message: "Server error: please contact an administrator" }); // JWT secret is not set
    }
    const token = jwt.sign(
      {
        id: result.id,
        username: result.username,
        role: result.role,
        deletedAt: result.deletedAt,
      },
      jwtSecret!,
      {
        expiresIn: "1h",
      }
    );

    // SEND RESPONSE HTTP COOKIES FOR TOKEN VALIDATION
    res.cookie("authToken", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Only on HTTPS production
      secure: false, // Cookies only send in HTTPS production
      sameSite: "strict",
      maxAge: 3600000,
    });

    return res.status(200).json({
      message: `Login success, Welcome ${result.username}`,
      user: {
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
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === "production", // Uncomment for production
      sameSite: "strict",
    });
    res.clearCookie("userData");

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
