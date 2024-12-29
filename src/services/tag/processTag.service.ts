// services/tagService.ts
import prisma from "../../models/prisma";

// Process individual tag
export const processTag = async (
  tag: { id?: string; name: string },
  userId: string
): Promise<any> => {
  if (!tag.name || typeof tag.name !== "string") {
    throw new Error("Each tag must have a valid 'name'.");
  }

  // Check if tag ID exists
  if (tag.id) {
    const existingTag = await prisma.tag.findUnique({
      where: { id: tag.id },
    });

    if (!existingTag) {
      throw new Error(`Tag with ID ${tag.id} does not exist.`);
    }
    return existingTag;
  }

  // Check for duplicate name
  const existingTagByName = await prisma.tag.findFirst({
    where: { name: tag.name },
  });

  if (existingTagByName) {
    throw new Error(`Tag with name \"${tag.name}\" already exists.`);
  }

  // Create new tag
  const newTag = await prisma.tag.create({
    data: {
      name: tag.name,
      userId,
    },
  });

  return newTag;
};
