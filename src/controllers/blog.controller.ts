import { Request, Response } from "express";
import { BlogStatus } from "@prisma/client";

import prisma from "../prisma/prisma";
import { validateTags } from "../services/tag";

// CREATE
const createNewBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET BODY
    const {
      title,
      content,
      status,
      publishedAt,
      tags,
      categoryId,
      allowComment,
    } = req.body;

    const user = req.user as {
      id: string;
    };
    const userId = user.id;

    const tagIds = tags.map((tag: { id: string }) => ({ id: tag.id }));

    // DATABASE CONNECTION
    const result = await prisma.blog.create({
      data: {
        title,
        content: JSON.parse(content),
        userId,
        categoryId,
        publishedAt: publishedAt ? publishedAt : null,
        deletedAt: null,
        status: status as BlogStatus,
        allowComment,
        tags: {
          connect: tagIds, // Hanya ID yang dikirimkan
        },
      },
    });

    return res
      .status(201)
      .json({ data: result, message: "Create a blog success!" });
  } catch (error) {
    console.error(error);
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
        coverImageId: true,
        coverImage: { select: { filepath: true } },
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

    const user = req.user;

    return res
      .status(200)
      .json({ data: result, message: "Get all blogs success!" });
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
        coverImageId: true,
        coverImage: { select: { filepath: true } },
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
        user: {
          select: {
            username: true,
            role: true,
            deletedAt: true,
          },
        },
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
    const { status, allowComment, publishedAt } = req.body;

    console.log(id);
    console.log(req.body);

    const result = await prisma.blog.update({
      where: { id },
      data: {
        publishedAt: new Date(),
        status: status as BlogStatus,
        allowComment,
      },
    });

    res
      .status(201)
      .json({ data: result, message: "Updating blog data success!" });
  } catch (error) {
    console.log(error);
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

const uploadContent = async (req: Request, res: Response) => {
  try {
    const { originalname, path, size } = req.file as Express.Multer.File;

    const user = req.user as { id: string };
    const userId = user.id;

    const media = await prisma.media.create({
      data: {
        filename: originalname,
        filepath: path,
        filesize: size,
        isUsed: false,
        userId,
      },
    });
    res
      .status(201)
      .json({ data: media, message: "Image uploaded successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading image", error });
  }
};

export default {
  createNewBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  uploadContent,
};
