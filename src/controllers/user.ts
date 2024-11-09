import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
const createNewUser = async (req: Request, res: Response) => {
  try {
    // GET BODY
    const { username, email, password, role, profileImage } = req.body;

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        profileImage,
        deletedAt: null,
      },
    });

    res.status(201).json({ data: result, message: "Create a user success!" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// READ
const getAllUsers = async (req: Request, res: Response) => {
  try {
    // DATABASE CONNECTION WITH SCHEMA
    const result = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    res.status(200).json({ data: result, messsage: "Get all users success!" });
  } catch (error) {
    res.status(500).json({ message: "Error when fetching users data", error });
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
        passwordHash: true,
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
    const { username, email, passwordHash, role, profileImage } = req.body;

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
const deleteUserPermanent = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

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

export default {
  createNewUser,
  getAllUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  deleteUserPermanent,
  restoreUserSoftDelete,
};
