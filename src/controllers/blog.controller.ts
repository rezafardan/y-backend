import { Request, Response, NextFunction } from "express";
import { BlogStatus } from "@prisma/client";
import prisma from "../prisma/prisma";

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

    console.log(req.body);

    // Parsing content string menjadi objek JSON
    let parsedContent: any;
    if (typeof content === "string") {
      try {
        parsedContent = JSON.parse(content); // Parse the stringified JSON
      } catch (error) {
        return res.status(400).json({ message: "Invalid content format." });
      }
    } else {
      parsedContent = content; // Jika sudah dalam bentuk objek JSON
    }

    let allowCommentBoolean: boolean;
    if (typeof allowComment === "string") {
      if (allowComment.toLowerCase() === "true") {
        allowCommentBoolean = true;
      } else if (allowComment.toLowerCase() === "false") {
        allowCommentBoolean = false;
      } else {
        return res.status(400).json({
          message: "Invalid allowComment value. Must be 'true' or 'false'.",
        });
      }
    } else if (typeof allowComment === "boolean") {
      allowCommentBoolean = allowComment;
    } else {
      return res.status(400).json({
        message: "allowComment must be a boolean or string ('true'/'false').",
      });
    }

    const bannerImage = req.file;

    const user = req.user as {
      id: string;
    };
    const userId = user.id;

    if (!bannerImage) {
      return res.json({ message: "Main Image is Required" });
    }
    const media = await prisma.media.create({
      data: {
        filename: bannerImage?.originalname,
        filepath: bannerImage?.path,
        filesize: bannerImage?.size,
        createdAt: new Date(),
        userId,
      },
    });

    let parsedTags: any[] = [];
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags); // Parse the stringified JSON
      } catch (error) {
        return res.status(400).json({ message: "Invalid tags format." });
      }
    } else if (Array.isArray(tags)) {
      parsedTags = tags; // Tags are already an array
    } else {
      return res
        .status(400)
        .json({ message: "Tags must be an array or string." });
    }

    const processedTags = await Promise.all(
      parsedTags.map(async (tag: any) => {
        try {
          if (tag.id && tag.id !== "") {
            console.log("Tag tidak lengkap:", tag);
            // Jika tag sudah ada (id tidak kosong), cek di database
            const existingTag = await prisma.tag.findUnique({
              where: { id: tag.id },
            });
            if (existingTag) {
              return existingTag; // Menggunakan tag yang sudah ada
            } else {
              throw new Error(`Tag with id ${tag.id} not found`);
            }
          } else {
            // Jika id kosong, buat tag baru
            const newTag = await prisma.tag.create({
              data: {
                name: tag.name,
                userId,
              },
            });
            return newTag; // Mengembalikan tag yang baru dibuat
          }
        } catch (error: any) {
          console.error(`Error processing tag: ${error.message}`);
          throw new Error(`Failed to process tag: ${tag.name}`);
        }
      })
    );

    // Filter tag yang berhasil diproses (menghindari null atau undefined)
    const validTags = processedTags.filter(
      (tag) => tag !== null && tag !== undefined
    );

    const imageContent = await prisma.media.update({
      where: { id: media.id },
      data: { isUsed: true },
    });

    // DATABASE CONNECTION
    const result = await prisma.blog.create({
      data: {
        title,
        content: parsedContent,
        mainImageId: media.id,
        userId,
        categoryId,
        publishedAt: publishedAt ? publishedAt : null,
        deletedAt: null,
        status: status as BlogStatus,
        allowComment: allowCommentBoolean,
        tags: {
          connect: validTags.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
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
        mainImageId: true,
        mainImage: { select: { filepath: true } },
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
        mainImageId: true,
        mainImage: { select: { filepath: true } },
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
