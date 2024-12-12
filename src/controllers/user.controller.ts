import { Request, Response } from "express";
import prisma from "../prisma/prisma";
import bcrypt from "bcrypt";
import fs from "fs";

// === USER SCHEMA ===
// id                    String            @id @default(cuid())
// username              String            @unique
// email                 String            @unique
// passwordHash          String            @map("password_hash")
// role                  UserRole          @default(AUTHOR)
// profileImage          String            @map("profile_image")
// createdAt             DateTime          @default(now()) @map("created_at")
// updatedAt             DateTime          @updatedAt @map("updated_at")
// deletedAt             DateTime?         @map("deleted_at") // Null if active, date if deleted (soft delete)

// CREATE
const createNewUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET BODY
    const { username, fullname, email, password, role } = req.body;
    const profileImage = req.file;
    console.log(profileImage);

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.create({
      data: {
        username,
        fullname,
        email,
        passwordHash,
        role,
        profileImage: profileImage?.path,
        deletedAt: null,
      },
    });

    return res
      .status(201)
      .json({ data: result, message: "Create a user success" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
};

// READ
const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    res.status(200).json({ data: result, messsage: "Get all users success!" });
  } catch (error) {
    res.status(500).json({ message: "Error when get users data", error });
  }
};

// READ BY ID
const getUserById = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    res
      .status(200)
      .json({ data: result, message: `Get user by id: ${id} success` });
  } catch (error) {
    res.status(500).json({ message: "Error when get user data", error });
  }
};

// UPDATE
const updateUser = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // GET BODY
    const { username, email, role, profileImage } = req.body;

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        role,
        profileImage,
      },
    });

    res
      .status(201)
      .json({ data: result, message: "Updating user data success!" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user data", error });
  }
};

// SOFT DELETE
const softDeleteUser = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.update({
      where: { id },
      data: { updatedAt: new Date(), deletedAt: new Date() },
    });

    // DATABASE CONNECTION WITH RELATION TO USER POST CATEGORY AND SET USER ACTIVE FALSE
    await prisma.category.updateMany({
      where: { userId: id },
      data: { isUserActive: false },
    });

    // DATABASE CONNECTION WITH RELATION TO USER POST BLOG AND SET USER ACTIVE FALSE
    await prisma.blog.updateMany({
      where: { userId: id },
      data: { isUserActive: false },
    });

    res.status(201).json({
      data: result,
      message: "User has been soft deleted successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error when soft deleting user data", error });
  }
};

// RESTORE USER
const restoreUserSoftDelete = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });

    // DATABASE CONNECTION WITH RELATION TO USER POST CATEGORY AND SET USER ACTIVE FALSE
    await prisma.category.updateMany({
      where: { userId: id },
      data: { isUserActive: true },
    });

    // DATABASE CONNECTION WITH RELATION TO USER POST BLOG AND SET USER ACTIVE FALSE
    await prisma.blog.updateMany({
      where: { userId: id },
      data: { isUserActive: true },
    });

    res.status(201).json({
      data: result,
      message: "User has been restore successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: "Error when restoring user data", error });
  }
};

// DELETE PERMANENT
const deleteUserPermanent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // GET ID
    const { id } = req.params;

    // GET PROFILE IMAGE
    const user = await prisma.user.findUnique({
      where: { id },
      select: { profileImage: true },
    });

    // IF ID NOT FOUND RETURN ERROR
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // DELETE PROFILE IMAGE IF THERE ARE PROFILE IMAGE IN DATABASE
    if (user.profileImage) {
      try {
        await fs.promises.unlink(user.profileImage);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error deleting profile image", error });
      }
    }

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ data: result, message: "Deleting user data success!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user data", error });
  }
};

const checkUsername = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET BODY
    const { username } = req.body;

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.findUnique({
      where: { username },
    });

    if (result) {
      return res.status(200).json({ isAvailable: false });
    }

    return res.status(200).json({ isAvailable: true });
  } catch (error) {
    return res.status(500).json({ isAvailable: false });
  }
};

export default {
  createNewUser,
  getAllUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  deleteUserPermanent,
  restoreUserSoftDelete,
  checkUsername,
};
