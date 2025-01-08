import { Request, Response } from "express";
import bcrypt from "bcrypt";
import fs from "fs";

// ORM
import prisma from "../models/prisma";

//  GET USER DATA THAT LOGGED IN FOR VIEW USER PROFILE ACTION
const getLoggedInUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET USER ID
    const userId = (req.user as { id: string }).id;

    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    // DATABASE CONNECTION WITH ORM
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        profileImage: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ data: user, message: "Get data user logged in success!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// PATCH USER DATA THAT LOGGED IN FOR EDIT USER PROFILE ACTION
const updateLoggedInUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // GET USER ID
    const userId = (req.user as { id: string }).id;

    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    // GET BODY
    const { fullname, email, password, role } = req.body;
    const profileImage = req.file;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // NEW DATA AND EXISTING DATA
    const updatedData: any = {
      fullname: fullname || existingUser.fullname,
      email: email || existingUser.email,
      role: role || existingUser.role,
      profileImage: profileImage?.path || existingUser.profileImage,
    };

    // NEW PASSWORD CREATE HASHING
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.passwordHash = await bcrypt.hash(password, salt);
    }

    // DELETE PROFILE IMAGE IF THERE ARE PROFILE IMAGE IN DATABASE
    if (profileImage && existingUser.profileImage) {
      try {
        await fs.promises.unlink(existingUser.profileImage);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error deleting profile image", error });
      }
    }

    // DATABASE CONNECTION WITH ORM
    const result = await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    res
      .status(200)
      .json({ data: result, message: "User profile updated successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// CREATE NEW USER
const createNewUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET BODY
    const { username, fullname, email, password, role } = req.body;
    const profileImage = req.file;

    // CHECK DUPLICATE EMAIL
    const emailValidation = await prisma.user.findUnique({
      where: { email },
    });

    if (emailValidation) {
      return res.status(500).json({
        message:
          "Error creating user, email alredy exist, please change your email!",
      });
    }

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // DATABASE CONNECTION WITH ORM
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
      .json({ data: result, message: "Create a user success!" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user", error });
  }
};

// GET ALL USER DATA
const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    // DATABASE CONNECTION WITH ORM
    const result = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullname: true,
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
    res.status(500).json({ message: "Internal server error", error });
  }
};

//  GET USER DATA BY ID
const getUserById = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION WITH ORM
    const result = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullname: true,
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
      .json({ data: result, message: `Get user by id: ${id} success!` });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// UPDATE USER DATA BY ID
const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET ID
    const { id } = req.params;

    // GET BODY
    const { fullname, email, password, role } = req.body;
    const profileImage = req.file;

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedData = {
      fullname: fullname || existingUser.fullname,
      email: email || existingUser.email,
      role: role || existingUser.role,
      profileImage: profileImage?.path || existingUser.profileImage,
      passwordHash: existingUser.passwordHash,
    };

    // HASHING PASSWORD
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.passwordHash = await bcrypt.hash(password, salt);
    }

    // DELETE PROFILE IMAGE IF THERE ARE PROFILE IMAGE IN DATABASE
    if (profileImage && existingUser.profileImage) {
      try {
        await fs.promises.unlink(existingUser.profileImage);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error deleting profile image", error });
      }
    }

    // DATABASE CONNECTION WITH ORM
    const result = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    res
      .status(201)
      .json({ data: result, message: "Updating user data success!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

//  SOFT DELETE USER DATA
const softDeleteUser = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION WITH ORM
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
    res.status(500).json({ message: "Internal server error", error });
  }
};

//  RESTORE USER DATA WHEN STATUS SOFT DELETE
const restoreUserSoftDelete = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION WITH ORM
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
    res.status(500).json({ message: "Internal server error", error });
  }
};

//  PERMANTENT DELETE USER DATA
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

    // DATABASE CONNECTION WITH ORM
    const result = await prisma.user.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ data: result, message: "Deleting user data success!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// CHECK USERNAME FOR CREATE A NEW USER TO AVOID DUPLICATE USER DATA
const checkUsername = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET BODY
    const { username } = req.body;

    // DATABASE CONNECTION WITH ORM
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
  getLoggedInUser,
  updateLoggedInUser,
  createNewUser,
  getAllUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  deleteUserPermanent,
  restoreUserSoftDelete,
  checkUsername,
};
