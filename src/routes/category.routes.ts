import express from "express";
import { authorizeRole } from "../middleware/roleAuthorization";
import categoryController from "../controllers/category.controller";

const router = express.Router();

// CREATE
router.post(
  "/",
  authorizeRole(["SUPERADMIN", "ADMIN", "EDITOR"]),
  categoryController.createNewCategory
);

// READ
router.get(
  "/",
  authorizeRole(["SUPERADMIN", "ADMIN", "AUTHOR", "EDITOR", "READER"]),
  categoryController.getAllCategories
);

// READ BY ID
router.get(
  "/:id",
  authorizeRole(["SUPERADMIN", "ADMIN", "AUTHOR", "EDITOR", "READER"]),
  categoryController.getCategoryByID
);

// UPDATE
router.patch(
  "/:id",
  authorizeRole(["SUPERADMIN", "ADMIN", "EDITOR"]),
  categoryController.updateCategory
);

// DELETE
router.delete(
  "/:id",
  authorizeRole(["SUPERADMIN", "ADMIN", "EDITOR"]),
  categoryController.deleteCategory
);

export default router;
