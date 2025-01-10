import express from "express";

// CONTROLLER
import categoryController from "../controllers/category.controller";

// MIDLLEWARE
import { authorizeRole } from "../middlewares/authorizeRole.middleware";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// CHECK TOTAL BLOG FROM SEVERAL CATEGORY
//   http://hostname/api/category/categories-with-blog-count
router.get(
  "/categories-with-blog-count",
  categoryController.getCategoriesWithBlogCount
);

// CREATE A NEW CATEGORY
//   POST RAW/JSON
//   http://hostname/api/category
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  categoryController.createNewCategory
);

// READ ALL CATEGORY DATA
//   http://hostname/api/category
router.get(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  categoryController.getAllCategories
);

// READ CATEGORY DATA BY ID
//   http://hostname/api/category/ID?
router.get(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  categoryController.getCategoryByID
);

// UPDATE CATEGORY DATA BY ID
//   http://hostname/api/category/ID?
router.patch(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  categoryController.updateCategory
);

// DELETE CATEGORY DATA BY ID
//   http://hostname/api/category/ID?
router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  categoryController.deleteCategory
);

export default router;
