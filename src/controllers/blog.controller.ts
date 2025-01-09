import prisma from "../models/prisma";
import { Request, Response } from "express";
import { BlogStatus } from "@prisma/client";
import { createTags } from "../services/blog/createTag.service";
import { extractContentImageIds } from "../services/blog/extractContentImage.service";
import { validateBlogStatus } from "../services/blog/validateBlogStatus.service";
import { validateBlogFields } from "../services/blog/validateBlogFields.service";

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
      publicationDate = validateBlogStatus(status, publishedAt);
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
    return res.status(500).json({ message: "Internal server error.", error });
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
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// UPDATE
const updateBlog = async (req: Request, res: Response) => {
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
      allowComment,
      publishedAt,
    } = req.body;

    const tagIds = await createTags(tags, userId, status);

    // Ambil tag yang sudah terhubung dengan blog ini
    const existingBlogTags = await prisma.blogTag.findMany({
      where: { blogId: id },
      select: { tagId: true },
    });

    const existingTagIds = existingBlogTags.map((blogTag) => blogTag.tagId);

    // Filter tag baru yang belum terhubung
    const newTagIds = tagIds.filter((tag) => !existingTagIds.includes(tag.id));

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
          create: newTagIds.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
        status: status as BlogStatus,
        allowComment,
        publishedAt,
      },
    });

    res
      .status(201)
      .json({ data: result, message: "Updating blog data success!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error.", error });
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
    res.status(500).json({ message: "Internal server error.", error });
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
