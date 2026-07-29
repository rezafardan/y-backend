import express from "express";

// CONTROLLER
import blogController from "../controllers/blog.controller";

// MIDDLEWARE
import accessValidation from "../middlewares/accessValidation.midlleware";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { uploadCover, uploadContent } from "../middlewares/upload.middleware";
import compressImage from "../middlewares/imageCompression.middleware";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// PENTING: route ini di-mount di index.ts TANPA accessValidation blanket
// (beda dari /api/user, /api/tag, /api/category), karena GET di bawah harus
// bisa dibaca situs blog publik (y-blogpage) yang tidak pernah login sebagai
// user CMS. Makanya setiap route TULIS (POST/PATCH/DELETE) di file ini pasang
// accessValidation sendiri dulu sebelum authorizeRole — authorizeRole butuh
// req.user yang cuma diisi accessValidation, kalau tidak dipasang di sini dia
// akan selalu 403 "Access denied. User not authenticated" untuk siapa pun.

// CREATE A NEW BLOG
//   POST MULTIPART/FORM-DATA
//   http://hostname/api/blog
router.post(
  "/",
  accessValidation,
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.createNewBlog
);

// POST IMAGE CONTENT
//   http://hostname/api/blog/content
router.post(
  "/contentimage",
  accessValidation,
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  uploadContent.single("contentimage"),
  compressImage("blog/content"),
  blogController.uploadBlogImage
);

// POST IMAGE COVER
//   http://hostname/api/blog/coverimage
router.post(
  "/coverimage",
  accessValidation,
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  uploadCover.single("coverimage"),
  compressImage("blog"),
  blogController.uploadBlogImage
);

// READ ALL BLOG DATA — SENGAJA PUBLIK (dipakai situs blog & dashboard sama-sama)
//   http://hostname/api/blog
router.get("/", blogController.getAllBlogs);

// READ BLOG DATA BY ID — SENGAJA PUBLIK
//   http://hostname/api/blog/ID?
router.get("/:id", blogController.getBlogById);

// UPDATE BLOG DATA BY ID
//   http://hostname/api/blog/ID?
router.patch(
  "/:id",
  accessValidation,
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.updateBlog
);

// DELETE BLOG DATA BY ID
//   http://hostname/api/blog/ID?
router.delete(
  "/:id",
  accessValidation,
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR"]),
  blogController.deleteBlog
);

export default router;
