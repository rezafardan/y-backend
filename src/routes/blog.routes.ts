import express from "express";
import { authorizeRole } from "../middleware/roleAuthorization";
import blogController from "../controllers/blog.controller";

const router = express.Router();

// CREATE
router.post(
  "/",
  authorizeRole(["SUPERADMIN", "ADMIN", "AUTHOR"]),
  blogController.createNewBlog
);

// READ
router.get(
  "/",
  authorizeRole(["SUPERADMIN", "ADMIN", "AUTHOR", "EDITOR", "READER"]),
  blogController.getAllBlogs
);

// READ BY ID
router.get(
  "/:id",
  authorizeRole(["SUPERADMIN", "ADMIN", "AUTHOR", "EDITOR", "READER"]),
  blogController.getBlogById
);

// APPROVE
router.patch(
  "/:id/approve",
  authorizeRole(["SUPERADMIN", "ADMIN", "EDITOR"]),
  blogController.updateBlog
);

// PUBLISH
router.patch(
  "/:id/publish",
  authorizeRole(["SUPERADMIN", "ADMIN", "EDITOR"]),
  blogController.updateBlog
);

// DELETE
router.delete(
  "/:id",
  authorizeRole(["SUPERADMIN", "ADMIN", "EDITOR"]),
  blogController.deleteBlog
);

export default router;
