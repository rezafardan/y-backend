import express from "express";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import categoryController from "../controllers/category.controller";

const router = express.Router();

// CREATE
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  categoryController.createNewCategory
);

// READ
router.get(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  categoryController.getAllCategories
);

// READ BY ID
router.get(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  categoryController.getCategoryByID
);

// UPDATE
router.patch(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  categoryController.updateCategory
);

// DELETE
router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  categoryController.deleteCategory
);

export default router;
