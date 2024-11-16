import { Request, Response, NextFunction } from "express";
import { BlogStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// === BLOG SCHEMA ===
// id                      String             @id @default(cuid())
// title                   String             @db.VarChar(255)
// content                 String             @db.Text
// status                  BlogStatus         @default(DRAFT)
// viewCount               Int                @default(0) @map("view_count")
// likeCount               Int                @default(0) @map("like_count")
// allowComment            Boolean            @map("allow_comment")
// schedulePulblishedAt    DateTime?          @map("schedule_published_at")
// publishedAt             DateTime?          @map("published_at")
// createdAt               DateTime           @default(now()) @map("created_at")
// updatedAt               DateTime           @updatedAt @map("edited_at")
// deletedAt               DateTime?          @map("deleted_at")
// mainImageId             String?            @map("main_image_id")
// userId                  String             @map("user_id")
// categoryId              String             @map("category_id")
// isUserActive            Boolean?           @default(true) @map("is_user_active")

// CREATE
const createNewBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET BODY
    const {
      title,
      content,
      mainImageId,
      status,
      allowComment,
      publishedAt,
      tags,
      userId,
      categoryId,
    } = req.body;

    // USER VALIDATION
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user?.deletedAt !== null) {
      return res
        .status(403)
        .json({ message: "User is inactive and cannot create blogs" });
    }
    if (user?.role !== "ADMINISTRATOR" && user?.role !== "AUTHOR") {
      return res
        .status(403)
        .json({ message: "You do not have permission to create a blog" });
    }

    // DATABASE CONNECTION
    const result = await prisma.blog.create({
      data: {
        title,
        content,
        mainImageId: null,
        userId,
        categoryId,
        publishedAt: publishedAt ? publishedAt : null,
        deletedAt: null,
        status: status as BlogStatus,
        tags,
        allowComment,
      },
    });

    return res
      .status(201)
      .json({ data: result, message: "Create a blog success!" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating blog", error });
  }
};

// READ
const getAllBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await prisma.blog.findMany({
      select: {
        id: true,
        status: true,
        title: true,
        content: true,
        mainImageId: true,
        allowComment: true,
        likeCount: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        isUserActive: true,
        tags: true,
        category: true,
        user: true,
      },
    });

    const user = req.user;

    return res
      .status(200)
      .json({ data: result, message: "Get all blogs success!", user: user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error when fetching blogs data", error });
  }
};

// READ BY ID
const getBlogById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        title: true,
        content: true,
        mainImageId: true,
        allowComment: true,
        likeCount: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        isUserActive: true,
        tags: true,
        category: true,
        user: true,
      },
    });
    return res
      .status(200)
      .json({ data: result, message: `Get blog by id: ${id} success` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error when fetching blog data", error });
  }
};

// UPDATE
const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      mainImageId,
      status,
      allowComment,
      publishedAt,
      userId,
      categoryId,
    } = req.body;

    const result = await prisma.blog.update({
      where: { id },
      data: {
        title,
        content,
        mainImageId,
        userId,
        categoryId,
        publishedAt,
        status: status as BlogStatus,
        allowComment,
      },
    });

    res
      .status(201)
      .json({ data: result, message: "Updating blog data success!" });
  } catch (error) {
    res.status(500).json({ message: "Error updating blog data", error });
  }
};

// DELETE
const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await prisma.blog.delete({
      where: { id },
    });

    res.status(200).json({ message: "Deleting blog data success!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog data", error });
  }
};

export default {
  createNewBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
