import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createNewTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const user = req.user as {
      id: string;
    };
    const userId = user.id;

    const result = await prisma.tag.create({
      data: {
        name,
        userId,
      },
    });

    res.status(201).json({ data: result, message: "Create a tag success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating tag", error });
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

export default {
  createNewTag,
  getAllTags,
};
