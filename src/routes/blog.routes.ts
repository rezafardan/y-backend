import express from "express";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import blogController from "../controllers/blog.controller";
import { uploadCover, uploadContent } from "../middlewares/upload.middleware";

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
  uploadContent.single("contentimage"),
  blogController.uploadBlogImage
);

router.post(
  "/coverimage",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  uploadCover.single("coverimage"),
  blogController.uploadBlogImage
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
  "/:id",
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
