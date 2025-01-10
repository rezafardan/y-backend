import prisma from "../../models/prisma";

// MODELS
import { Tag } from "@prisma/client";

export const createTags = async (
  tags: Tag[],
  userId: string,
  status: string
) => {
  // STATUS DRAFT CAN BE CONTINUED EVEN WITHOUT TAG
  if (status === "DRAFT" && (!tags || tags.length === 0)) {
    return [];
  }

  // SEPARATE NEW TAG (WITH ID) AND EXISTING TAG (WITH ID)
  const newTags = tags.filter((tag: { id: string }) => !tag.id);
  const existingTags = tags.filter((tag: { id: string }) => tag.id);

  // VALIDATE NAME OF NEW TAG WITH EXISTING NAME TAG ON DATABASE
  const existingTagsFromDB = await prisma.tag.findMany({
    where: { name: { in: newTags.map((tag: { name: string }) => tag.name) } },
    select: { id: true, name: true },
  });

  // FILTER NEW TAG (NOT IN DATABASE)
  const tagsToCreate = newTags.filter(
    (tag: { name: string }) =>
      !existingTagsFromDB.some((dbTag) => dbTag.name === tag.name)
  );

  // CREATE NEW TAG
  let createdTags: { id: string; name: string }[] = [];

  if (tagsToCreate.length > 0) {
    await prisma.tag.createMany({
      data: tagsToCreate.map((tag: { name: string }) => ({
        name: tag.name,
        userId,
      })),
    });

    // SELECT ID OF NEW CREATE TAG
    createdTags = await prisma.tag.findMany({
      where: {
        name: { in: tagsToCreate.map((tag: { name: string }) => tag.name) },
      },
      select: { id: true, name: true },
    });
  }

  // COMINE ID OF EXISTING TAG, NEW CREATE TAG, AND EXISTING TAG (WITH ID)
  return [
    ...existingTags.map((tag: { id: any }) => ({ id: tag.id })),
    ...existingTagsFromDB.map((tag) => ({ id: tag.id })),
    ...createdTags,
  ];
};
