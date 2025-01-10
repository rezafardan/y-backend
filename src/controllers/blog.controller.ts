// ORM
import prisma from "../models/prisma";

import { Request, Response } from "express";

// FILE SYSTEM AND FILE PATH
import fs from "fs";
import path from "path";

// MODELS
import { BlogStatus } from "@prisma/client";

// SERVICE
import { validateBlogFields } from "../services/blog/validateBlogFields.service";
import { extractContentImageIds } from "../services/blog/extractContentImage.service";
import { validateBlogStatusForPulication } from "../services/blog/validateBlogStatus.service";
import { createTags } from "../services/blog/createTag.service";

// UPLOADING IMAGE COVER AND IMAGE CONTENT
const uploadBlogImage = async (req: Request, res: Response) => {
  try {
    // GET USER ID DATA
    const userId = (req.user as { id: string }).id;

    // GET FILE DATA
    const { originalname, path, size } = req.file as Express.Multer.File;

    // DATABASE CONNECTION WITH ORM
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
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// CREATE NEW BLOG
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
      status,
      publishedAt,
      allowComment,
    } = req.body;

    // VALIDATE BLOG FIELD
    await validateBlogFields(req.body, status);

    // EXTRACT IMAGE CONTENT
    const contentImageIds = extractContentImageIds(JSON.parse(content));

    // VALIDATE EXISTING IMAGE IDS
    const existingContentImages = await prisma.media.findMany({
      where: { id: { in: contentImageIds } },
    });

    if (existingContentImages.length !== contentImageIds.length) {
      return res.status(400).json({
        message: "Some content image IDs do not exist in the Media table.",
      });
    }

    // SET PUBLISH DATE
    let publicationDate: any;

    try {
      publicationDate = validateBlogStatusForPulication(status, publishedAt);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }

    // DATABASE CONNECTION WITH ORM
    const result = await prisma.$transaction(async (prisma) => {
      // CREATE NEW TAG IF IT DOESN'T EXIST YET
      const allTagIds = await createTags(tags, userId, status);

      // CREATE NEW BLOG
      const createdBlog = await prisma.blog.create({
        data: {
          userId,
          title,
          slug,
          coverImageId,
          content: JSON.parse(content),
          categoryId,
          tags: {
            create: allTagIds.map((tag) => ({
              tag: { connect: { id: tag.id } },
            })),
          },
          status,
          publishedAt: publicationDate,
          allowComment,
        },
      });

      // CONNECTING RELATIONAL IMAGE COVER AND IMAGE CONTENT TO BLOG
      await prisma.blogContentImage.createMany({
        data: contentImageIds.map((imageId) => ({
          blogId: createdBlog.id,
          mediaId: imageId,
        })),
      });

      // UPDATE STATUS IMAGE TO ISUSED ON IMAGE USE (COVER AND CONTENT)
      if (status !== "DRAFT") {
        await prisma.media.updateMany({
          where: {
            id: {
              in: [coverImageId, ...contentImageIds],
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
      .json({ data: result, message: "Blog processed successfully!" });
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }

    return res
      .status(500)
      .json({ message: `Internal server error. ${error.message}` });
  }
};

// GET ALL BLOG DATA
const getAllBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        coverImageId: true,
        coverImage: { select: { filepath: true } },
        content: true,
        category: true,
        tags: true,
        status: true,
        publishedAt: true,
        allowComment: true,

        likeCount: true,
        viewCount: true,

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

    return res
      .status(200)
      .json({ data: result, message: "Get all blogs success!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

//  GET BLOG DATA BY ID
const getBlogById = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET ID
    const { id } = req.params;

    // DATABASE CONNECTION WITH ORM
    const result = await prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        coverImageId: true,
        coverImage: { select: { filepath: true } },
        category: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        status: true,
        publishedAt: true,
        allowComment: true,

        likeCount: true,
        viewCount: true,

        createdAt: true,
        updatedAt: true,
        isUserActive: true,

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
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// UPDATE BLOG DATA BY ID
const updateBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    // GET USER ID DATA
    const userId = (req.user as { id: string }).id;

    // GET ID
    const { id } = req.params;

    // GET BODY
    const {
      title,
      slug,
      coverImageId,
      content,
      categoryId,
      tags,
      status,
      publishedAt,
      allowComment,
    } = req.body;

    // VALIDATE BLOG FIELDS
    await validateBlogFields(req.body, status, id);

    // EXTRACT IMAGE CONTENT
    const contentImageIds = extractContentImageIds(JSON.parse(content));

    // VALIDATE EXISTING IMAGE IDS
    const existingContentImages = await prisma.media.findMany({
      where: { id: { in: contentImageIds } },
    });

    if (existingContentImages.length !== contentImageIds.length) {
      return res.status(400).json({
        message: "Some content image IDs do not exist in the Media table.",
      });
    }

    // SET PUBLISH DATE
    let publicationDate: any;
    try {
      publicationDate = validateBlogStatusForPulication(status, publishedAt);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }

    // DATABASE TRANSACTION
    const result = await prisma.$transaction(async (prisma) => {
      // CREATE NEW TAGS IF NOT EXIST
      const allTagIds = await createTags(tags, userId, status);

      // UPDATE BLOG DATA
      const updatedBlog = await prisma.blog.update({
        where: { id },
        data: {
          title,
          slug,
          coverImageId: coverImageId ? coverImageId : null,
          content: JSON.parse(content),
          categoryId,
          tags: {
            deleteMany: {}, // Remove existing tags
            create: allTagIds.map((tag) => ({
              tag: { connect: { id: tag.id } },
            })),
          },
          status: status as BlogStatus,
          allowComment,
          publishedAt: publicationDate,
        },
      });

      // UPDATE CONTENT IMAGE RELATIONS
      await prisma.blogContentImage.deleteMany({ where: { blogId: id } });
      await prisma.blogContentImage.createMany({
        data: contentImageIds.map((imageId) => ({
          blogId: id,
          mediaId: imageId,
        })),
      });

      // UPDATE MEDIA STATUS
      await prisma.media.updateMany({
        where: {
          id: { in: [coverImageId, ...contentImageIds] },
        },
        data: { isUsed: status !== "DRAFT" },
      });

      return updatedBlog;
    });

    res
      .status(201)
      .json({ data: result, message: "Updating blog data success!" });
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal server error.", error });
  }
};

const deleteBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // GET BLOG DATA AND MEDIA CAN RELATE
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        coverImage: true,
        contentImages: { select: { media: true } },
      },
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // DELETE COVER IMAGE IF EXISTS
    if (blog.coverImage && blog.coverImage.filepath) {
      const coverImagePath = path.join(
        process.cwd(),
        "public/assets/blog",
        path.basename(blog.coverImage.filepath)
      );

      try {
        if (fs.existsSync(coverImagePath)) {
          await fs.promises.unlink(coverImagePath);
        }
      } catch (err) {
        console.error("Error deleting cover image:", err);
      }
    }

    // DELETE CONTENT IMAGES IF EXIST
    if (blog.contentImages && blog.contentImages.length > 0) {
      for (const contentImage of blog.contentImages) {
        if (!contentImage.media.filepath) continue;

        const contentImagePath = path.join(
          process.cwd(),
          "public/assets/blog/content",
          path.basename(contentImage.media.filepath)
        );

        try {
          if (fs.existsSync(contentImagePath)) {
            await fs.promises.unlink(contentImagePath);
          }
        } catch (err) {
          console.error("Error deleting content image:", err);
        }
      }
    }

    // DELETE MEDIA FROM DATABASE
    const mediaIds = [
      blog.coverImage?.id,
      ...blog.contentImages.map((c) => c.media.id),
    ].filter(Boolean);

    if (mediaIds.length > 0) {
      await prisma.media.deleteMany({
        where: { id: { in: mediaIds as string[] } },
      });
    }

    // DELETE BLOG FROM DATABASE
    await prisma.blog.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Blog and associated images deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

export default {
  uploadBlogImage,
  createNewBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
