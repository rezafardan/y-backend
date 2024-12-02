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
      status,
      allowComment,
      publishedAt,
      tags,
      categoryId,
    } = req.body;

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
        tags: {
          connect: validTags.map((tag) => ({ id: tag.id })),
        },
        allowComment: allowCommentBoolean,
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
