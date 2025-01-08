import { Tag } from "@prisma/client";
import prisma from "../../models/prisma";

export const createTags = async (
  tags: Tag[],
  userId: string,
  status: string
) => {
  // Jika statusnya adalah "DRAFT" dan tags kosong, perbolehkan tag kosong
  if (status === "DRAFT" && (!tags || tags.length === 0)) {
    return [];
  }

  // Pisahkan tag baru (tanpa ID) dan tag lama (dengan ID)
  const newTags = tags.filter((tag: { id: string }) => !tag.id);
  const existingTags = tags.filter((tag: { id: string }) => tag.id);

  // Periksa apakah ada tag baru dengan nama yang sudah ada di database
  const existingTagsFromDB = await prisma.tag.findMany({
    where: { name: { in: newTags.map((tag: { name: string }) => tag.name) } },
    select: { id: true, name: true },
  });

  // Filter tag yang benar-benar baru (tidak ada di database)
  const tagsToCreate = newTags.filter(
    (tag: { name: string }) =>
      !existingTagsFromDB.some((dbTag) => dbTag.name === tag.name)
  );

  // Buat tag baru di database jika ada tag yang benar-benar baru
  let createdTags: { id: string; name: string }[] = [];
  if (tagsToCreate.length > 0) {
    await prisma.tag.createMany({
      data: tagsToCreate.map((tag: { name: string }) => ({
        name: tag.name,
        userId,
      })),
    });

    // Ambil ID dari tag baru yang berhasil dibuat
    createdTags = await prisma.tag.findMany({
      where: {
        name: { in: tagsToCreate.map((tag: { name: string }) => tag.name) },
      },
      select: { id: true, name: true },
    });
  }

  // Gabungkan ID dari tag yang sudah ada di database, tag yang baru dibuat, dan tag lama (dengan ID)
  return [
    ...existingTags.map((tag: { id: any }) => ({ id: tag.id })),
    ...existingTagsFromDB.map((tag) => ({ id: tag.id })),
    ...createdTags,
  ];
};
