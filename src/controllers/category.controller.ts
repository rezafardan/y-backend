import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// === BLOG SCHEMA ===
// id                  String             @id @default(cuid())
// name                String             @db.VarChar(255)
// description         String             @db.VarChar(255)
// createdAt           DateTime           @default(now()) @map("created_at")
// updatedAt           DateTime           @updatedAt @map("updated_at")
// deleteAt            DateTime?          @map("delete_at")
// userId              String             @map("user_id")
// isUserActive        Boolean?           @map("is_user_active")

// CREATE
const createNewCategory = async (req: Request, res: Response) => {
  try {
    // GET BODY
    const { name, description } = req.body;
    const user = req.user as {
      id: string;
    };
    const userId = user.id;

    // DATABASE CONNECTION
    const result = await prisma.category.create({
      data: {
        name,
        description,
        userId,
        deleteAt: null,
      },
    });

    res
      .status(201)
      .json({ data: result, message: "Create a category success!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating category", error });
  }
};

// READ
const getAllCategories = async (req: Request, res: Response) => {
  try {
    // DATABASE CONNECTION
    const result = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        isUserActive: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            deletedAt: true,
          },
        },
      },
    });

    res
      .status(200)
      .json({ data: result, message: "Get all categories success!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error when fetching categories data", error });
  }
};

// READ BY ID
const getCategoryByID = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION
    const result = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        isUserActive: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            deletedAt: true,
          },
        },
      },
    });
    res
      .status(200)
      .json({ data: result, message: `Get category by id: ${id} success` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error when fetching categories data", error });
  }
};

// UPDATE
const updateCategory = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // GET BODY
    const { name, description } = req.body;

    // DATABASE CONNECTION
    const result = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    res
      .status(201)
      .json({ data: result, message: "Updating category data success!" });
  } catch (error) {
    res.status(500).json({ message: "Error updating category data", error });
  }
};

// DELETE
const deleteCategory = async (req: Request, res: Response) => {
  try {
    // GET UD
    const { id } = req.params;

    // DATABASE CONNECTION
    const result = await prisma.category.delete({
      where: { id },
    });

    res
      .status(201)
      .json({ data: result, message: "Deleting category data success!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category data", error });
  }
};

export default {
  createNewCategory,
  getCategoryByID,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
