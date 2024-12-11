import prisma from "../prisma/prisma";
export const validateTags = async (tagIds: Array<{ id: string }>) => {
  // Ambil hanya ID dari setiap objek
  const ids = tagIds.map((tag) => tag.id);

  const tags = await prisma.tag.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  const foundTagIds = tags.map((tag) => tag.id);
  const missingTags = ids.filter((id) => !foundTagIds.includes(id));

  if (missingTags.length > 0) {
    throw new Error(`Tags not found: ${missingTags.join(", ")}`);
  }

  return foundTagIds; // Return valid tag IDs
};
