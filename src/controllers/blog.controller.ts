import prisma from "../models/prisma";
import { Request, Response } from "express";
import { BlogStatus } from "@prisma/client";
import { createTags } from "../services/blog/tag.service";
import { extractContentImageIds } from "../services/blog/contentImage.service";
import { validateBlogStatus } from "../services/blog/status.service";
import validateBlogFields from "../services/blog/validateBlogStatus.service";

// CREATE
const createNewBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET USER ID DATA
    const userId = (req.user as { id: string }).id;

    // GET BODY DATA
    const {
      title,
      slug,
      coverImageId,
      content,
      categoryId,
      tags,
      publishedAt,
      status,
      allowComment,
    } = req.body;

    console.log(req.body);

    try {
      validateBlogFields(req.body, status);
    } catch (error) {
      return res.status(400).json({ message: "Error" });
    }

    if (!content) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    const contentImageIds = extractContentImageIds(JSON.parse(content));

    let publicationDate;
    try {
      publicationDate = validateBlogStatus(status, publishedAt);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Buat tags jika belum ada
      const allTagIds = await createTags(tags, userId, status);

      // Buat blog baru
      const createdBlog = await prisma.blog.create({
        data: {
          userId,
          title,
          slug,
          coverImageId,
          content: JSON.parse(content),
          contentImages: {
            connect: contentImageIds.map((id) => ({ id })),
          },
          categoryId,
          tags: {
            connect: allTagIds,
          },
          publishedAt: publicationDate,
          status,
          allowComment,
        },
      });

      // Update status 'isUsed' pada gambar yang digunakan (cover dan konten)
      if (status !== "DRAFT") {
        await prisma.media.updateMany({
          where: {
            id: {
              in: [coverImageId, ...contentImageIds], // Gabungkan cover dan gambar konten
            },
          },
          data: {
            isUsed: true,
          },
        });
      }

      return createdBlog;
    });

    return res
      .status(201)
      .json({ data: result, message: "Create a blog success!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error creating blog", error });
  }
};

// CREATE
const uploadBlogImage = async (req: Request, res: Response) => {
  try {
    // GET USER ID DATA
    const userId = (req.user as { id: string }).id;

    // GET FILE DATA
    const { originalname, path, size } = req.file as Express.Multer.File;

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
    res.status(500).json({ message: "Error uploading image", error });
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
        slug: true,
        content: true,
        coverImageId: true,
        coverImage: { select: { filepath: true } },
        allowComment: true,
        likeCount: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
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
        slug: true,
        content: true,
        coverImageId: true,
        coverImage: { select: { filepath: true } },
        allowComment: true,
        likeCount: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        isUserActive: true,
        tags: true,
        category: true,
        user: {
          select: {
            username: true,
            role: true,
            profileImage: true,
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
    const userId = (req.user as { id: string }).id;
    const { id } = req.params;
    const {
      title,
      slug,
      coverImageId,
      content,
      categoryId,
      tags,
      status,
      allowComment,
      publishedAt,
    } = req.body;

    console.log(req.body);

    const tagIds = await createTags(tags, userId, status);

    const contentImageIds = extractContentImageIds(JSON.parse(content));

    const result = await prisma.blog.update({
      where: { id },
      data: {
        title,
        slug,
        coverImageId: coverImageId ? coverImageId : null,
        content: JSON.parse(content),
        contentImages: {
          connect: contentImageIds.map((id) => ({ id })),
        },

        categoryId,
        tags: {
          connect: tagIds,
        },
        status: status as BlogStatus,
        allowComment,
        publishedAt,
      },
    });

    console.log("ini result", result);

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

export default {
  createNewBlog,
  uploadBlogImage,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
