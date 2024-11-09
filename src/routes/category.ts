import express from "express";
import categoryController from "../controllers/category";

const router = express.Router();

// CREATE
router.post("/", categoryController.createNewCategory);
// READ
router.get("/", categoryController.getAllCategories);
// READ BY ID
router.get("/:id", categoryController.getCategoryByID);
// UPDATE
router.patch("/:id", categoryController.updateCategory);
// DELETE
router.delete("/:id", categoryController.deleteCategory);

export default router;
