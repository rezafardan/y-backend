import prisma from "../../models/prisma";
import { Tag } from "@prisma/client";

export const createTags = async (
  tags: Tag[],
  userId: string,
  status: string
) => {
  // Jika statusnya adalah "DRAFT" dan tags kosong, perbolehkan tag kosong
  if (status === "DRAFT" && (!tags || tags.length === 0)) {
    return [];
  }

  // SEPARATE NEW TAGS (WITHOUT ID) AND EXISTING TAGS (WITH ID)
  const newTags = tags.filter((tag: { id: string }) => !tag.id);
  const existingTags = tags.filter((tag: { id: string }) => tag.id);

  // IG TAG ID EMPTY, CREATE NEW TAG
  let createdTags: { id: string }[] = [];
  if (newTags.length > 0) {
    await prisma.tag.createMany({
      data: newTags.map((tag: { name: string }) => ({
        name: tag.name,
        userId,
      })),
    });

    // SELECT ID FROM NEWLY CREATED TAG
    createdTags = await prisma.tag.findMany({
      where: { name: { in: newTags.map((tag: { name: string }) => tag.name) } },
      select: { id: true },
    });
  }

  // COMBINE CREATED TAG IDS AND EXISTING TAG IDS
  return [
    ...existingTags.map((tag: { id: any }) => ({ id: tag.id })),
    ...createdTags,
  ];
};
