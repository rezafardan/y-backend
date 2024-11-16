import express from "express";
import { authorizeRole } from "../middleware/roleAuthorization";
import blogController from "../controllers/blog.controller";

const router = express.Router();

// CREATE
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  blogController.createNewBlog
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

// APPROVE
router.patch(
  "/:id/approve",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  blogController.updateBlog
);

// PUBLISH
router.patch(
  "/:id/publish",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  blogController.updateBlog
);

// DELETE
router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  blogController.deleteBlog
);

export default router;
