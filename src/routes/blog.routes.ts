import express from "express";
import { authorizeRole } from "../middleware/roleAuthorization.middleware";
import blogController from "../controllers/blog.controller";
import { uploadCover, uploadContent } from "../middleware/upload.middleware";

const router = express.Router();

// CREATE
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.createNewBlog
);

// POST IMAGE CONTENT
router.post(
  "/content",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  uploadContent.single("content"),
  blogController.uploadContent
);

router.post(
  "/cover",
  authorizeRole(["ADMINISTRATOR"]),
  uploadCover.single("coverImageId"),
  blogController.uploadContent
);

// READ
router.get(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  blogController.getAllBlogs
);

// READ BY ID
router.get(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  blogController.getBlogById
);

// UPDATE
router.patch(
  "/update/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.updateBlog
);

// DELETE
router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.deleteBlog
);

export default router;
