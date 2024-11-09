import express from "express";
import blogController from "../controllers/blog";
import validationBlogAction from "../middlewares/validatationBlogAction";

const router = express.Router();

// CREATE
router.post("/", blogController.createNewBlog);
// READ
router.get("/", blogController.getAllBlogs);
// READ BY ID
router.get("/:id", blogController.getBlogById);
// APPROVE
router.patch(
  "/:id/approve",
  validationBlogAction("approve"),
  blogController.updateBlog
);
// PUBLISH
router.patch(
  "/:id/publish",
  validationBlogAction("publish"),
  blogController.updateBlog
);
// DELETE
router.delete("/:id", blogController.deleteBlog);

export default router;
