// ORN
import prisma from "../models/prisma";

import { Request, Response } from "express";

// CREATE NEW CATEGORY
const createNewCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET USER ID
    const userId = (req.user as { id: string }).id;

    // GET BODY
    const { name, description } = req.body;

    // CHECK DUPLICATION CATEGORY NAME
    const existingCategory = await prisma.category.findFirst({
      where: { name: name },
    });

    if (existingCategory) {
      return res.status(404).json({
        message:
          "Category with this name already exists. Please choose another name.",
      });
    }

    // DATABASE CONNECTION WITH ORM
    const result = await prisma.category.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res
      .status(201)
      .json({ data: result, message: "Category processed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// GET ALL CATEGORY DATA
const getAllCategories = async (req: Request, res: Response) => {
  try {
    // DATABASE CONNECTION WITH ORM
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
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// GET CATEGORY BY ID
const getCategoryByID = async (req: Request, res: Response) => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION WITH ORM
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
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// UPDATE CATEGORY DATA BY ID
const updateCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET ID
    const { id } = req.params;

    // GET BODY
    const { name, description } = req.body;

    // CHECK DUPLICATION CATEGORY NAME
    const existingCategory = await prisma.category.findFirst({
      where: { name: name },
    });

    if (existingCategory) {
      return res.status(404).json({
        message:
          "Category with this name already exists. Please choose another name.",
      });
    }

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
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// DELETE CATEGORY DATA
const deleteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET UD
    const { id } = req.params;

    // CHECK IF CATEGORY STILL USED BY BLOG
    const categoryInUse = await prisma.category.findUnique({
      where: { id },
      select: {
        Blogs: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (categoryInUse && categoryInUse.Blogs.length > 0) {
      // TOTAL BLOGS
      const blogCount = categoryInUse.Blogs.length;

      return res.status(400).json({
        message: `This category is still used in ${blogCount} blog${
          blogCount > 1 ? "s" : ""
        }. Cannot delete category.`,
      });
    }

    // DATABASE CONNECTION WITH ORM
    const result = await prisma.category.delete({
      where: { id },
    });

    res
      .status(201)
      .json({ data: result, message: "Deleting category data success!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error.", error });
  }
};

const getCategoriesWithBlogCount = async (req: Request, res: Response) => {
  try {
    // GET CATEGORY DATA WITH TOTAL BLOGS PER CATEGORY
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { Blogs: true },
        },
      },
    });

    res.status(200).json({
      data: categories,
      message: "Fetched categories with blog count successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error.", error });
  }
};

export default {
  createNewCategory,
  getCategoryByID,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoriesWithBlogCount,
};
