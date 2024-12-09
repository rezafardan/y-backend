import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";

const createNewTag = async (req: Request, res: Response): Promise<any> => {
  try {
    const { tags } = req.body;

    // Validasi pengguna
    const user = req.user as { id: string };
    if (!user || !user.id) {
      return res.status(401).json({ message: "Unauthorized access." });
    }
    const userId = user.id;

    // Validasi format tags
    if (!Array.isArray(tags)) {
      return res
        .status(400)
        .json({ message: "Tags must be an array of objects." });
    }

    const processedTags = await Promise.all(
      tags.map(async (tag) => {
        if (!tag.name || typeof tag.name !== "string") {
          throw new Error("Each tag must have a valid 'name'.");
        }

        // Jika ID ada, cari tag yang sudah ada
        if (tag.id) {
          const existingTag = await prisma.tag.findUnique({
            where: { id: tag.id },
          });

          if (!existingTag) {
            throw new Error(`Tag with ID ${tag.id} does not exist.`);
          }
          return existingTag;
        }

        // Validasi jika ada tag dengan nama yang sama
        const existingTagByName = await prisma.tag.findFirst({
          where: { name: tag.name, userId }, // Periksa nama tag khusus pengguna
        });

        if (existingTagByName) {
          throw new Error(`Tag with name "${tag.name}" already exists.`);
        }

        // Jika ID tidak ada dan name tidak duplikat, buat tag baru
        const newTag = await prisma.tag.create({
          data: {
            name: tag.name,
            userId, // Hubungkan ke pengguna
          },
        });

        return newTag;
      })
    );

    res
      .status(201)
      .json({ data: processedTags, message: "Tags processed successfully." });
  } catch (error: any) {
    console.error("Error creating tags:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Internal server error." });
  }
};

const getAllTags = async (req: Request, res: Response) => {
  try {
    const result = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    res.status(200).json({ data: result, message: "Get all tags success!" });
  } catch (error) {
    res.status(500).json({ message: "Error when fetching tags data", error });
  }
};

const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await prisma.tag.delete({
      where: { id },
    });

    res.status(200).json({ message: "Deleting tag data success!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tag data", error });
  }
};

export default {
  createNewTag,
  getAllTags,
  deleteTag,
};
