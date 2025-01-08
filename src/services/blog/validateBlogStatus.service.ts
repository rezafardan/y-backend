import { BlogStatus } from "@prisma/client";

export const validateBlogStatus = (
  status: BlogStatus,
  publishedAt: string | number | Date
) => {
  // VALIDATION STATUS
  if (!["DRAFT", "PUBLISH", "SCHEDULE"].includes(status)) {
    throw new Error("Invalid blog status.");
  }

  const now = new Date();

  if (status === "PUBLISH" || status === "SCHEDULE") {
    if (!publishedAt) {
      throw new Error(
        "Published or scheduled blogs must have a publication date."
      );
    }

    const publicationDate = new Date(publishedAt);

    // RULE VALIDATION: DATE CANNOT BE MORE THAN 30 DAYS OLD
    const maxBackDate = new Date();
    maxBackDate.setDate(now.getDate() - 30);

    if (publicationDate < maxBackDate) {
      throw new Error(
        `The publication date cannot be earlier than ${
          maxBackDate.toISOString().split("T")[0]
        }.`
      );
    }

    return publicationDate;
  }

  // FOR DRAFT STATUS
  if (status === "DRAFT") {
    if (publishedAt) {
      const publicationDate = new Date(publishedAt);

      // RULE VALIDATION: DATE CANNOT BE MORE THAN 30 DAYS OLD
      const maxBackDate = new Date();
      maxBackDate.setDate(now.getDate() - 30);

      if (publicationDate < maxBackDate) {
        throw new Error(
          `The publication date for drafts cannot be earlier than ${
            maxBackDate.toISOString().split("T")[0]
          }.`
        );
      }

      return publicationDate;
    }
  }

  return null;
};
