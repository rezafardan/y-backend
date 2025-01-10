// FUNCTION TO VALIDATING BLOG VALUE
import prisma from "../../models/prisma";

export const validateBlogFields = async (
  body: any,
  status: string,
  id?: string
): Promise<any> => {
  // REQUIRE DATA
  const requiredFields: any = {
    DRAFT: ["title", "slug", "content", "categoryId"],
    PUBLISH: [
      "title",
      "slug",
      "coverImageId",
      "content",
      "categoryId",
      "tags",
      "allowComment",
    ],
    SCHEDULE: [
      "title",
      "slug",
      "coverImageId",
      "content",
      "categoryId",
      "tags",
      "allowComment",
      "publishedAt",
    ],
  };

  // FIELD VALIDATION
  const fieldsToValidate = requiredFields[status] || [];

  const missingFields = fieldsToValidate.filter(
    (field: string) => !body[field]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields for ${status}: ${missingFields.join(", ")}`
    );
  }

  // IF STATUS DRAFT, ALLOWED TO EMPTY CONTENT
  if (status !== "DRAFT" && !body.content) {
    throw new Error("Content cannot be empty");
  }

  // VALIDATE TITLE LENGTH
  if (body.title.length > 255) {
    throw new Error("Title cannot exceed 255 characters.");
  }

  // VALIDATE SLUG LENGTH
  if (body.slug.length > 255) {
    throw new Error("Slug cannot exceed 255 characters.");
  }

  // VALIDATE DUPLICATE SLUG (CREATE & UPDATE)
  const existingSlug = await prisma.blog.findUnique({
    where: { slug: body.slug },
  });

  if (existingSlug && existingSlug.id !== id) {
    throw new Error("Slug must be unique. The provided slug already exists.");
  }

  // VALIDATE COVER IMAGE ON DATABASE
  if (body.coverImageId) {
    const coverImageIdExists = await prisma.media.findUnique({
      where: { id: body.coverImageId },
    });

    if (!coverImageIdExists) {
      throw new Error("Cover Image ID does not exist.");
    }
  } else if (status !== "DRAFT") {
    throw new Error("Cover Image ID is required for PUBLISH or SCHEDULE.");
  }

  // VALIDATE CONTENT
  if (!body.content) {
    throw new Error("Content cannot be empty");
  }

  // VALIDATE CATEGORY
  const categoryIdExists = await prisma.category.findUnique({
    where: { id: body.categoryId },
  });

  if (!categoryIdExists) {
    throw new Error("Category ID does not exist");
  }

  // PUBLISHED IS REQUIRED FOR SCHEDULE STATUS
  if (status === "SCHEDULE" && !body.publishedAt) {
    throw new Error("Published date is required for SCHEDULE status.");
  }
};
