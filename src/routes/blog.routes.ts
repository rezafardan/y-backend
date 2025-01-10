import express from "express";

// CONTROLLER
import blogController from "../controllers/blog.controller";

// MIDDLEWARE
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { uploadCover, uploadContent } from "../middlewares/upload.middleware";
import compressImage from "../middlewares/imageCompression.middleware";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// CREATE A NEW BLOG
//   POST MULTIPART/FORM-DATA
//   http://hostname/api/blog
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.createNewBlog
);

// POST IMAGE CONTENT
//   http://hostname/api/blog/content
router.post(
  "/contentimage",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  uploadContent.single("contentimage"),
  compressImage("blog/content"),
  blogController.uploadBlogImage
);

// POST IMAGE COVER
//   http://hostname/api/blog/coverimage
router.post(
  "/coverimage",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  uploadCover.single("coverimage"),
  compressImage("blog"),
  blogController.uploadBlogImage
);

// READ ALL BLOG DATA
//   http://hostname/api/blog
router.get(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  blogController.getAllBlogs
);

// READ BLOG DATA BY ID
//   http://hostname/api/blog/ID?
router.get(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  blogController.getBlogById
);

// UPDATE BLOG DATA BY ID
//   http://hostname/api/blog/ID?
router.patch(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.updateBlog
);

// DELETE BLOG DATA BY ID
//   http://hostname/api/blog/ID?
router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.deleteBlog
);

export default router;
