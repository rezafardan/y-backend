import express from "express";
import { authorizeRole } from "../middleware/roleAuthorization.middleware";
import tagController from "../controllers/tag.controller";

const router = express.Router();

router.post(
  "/",
  authorizeRole(["ADMINISTRATOR", "AUTHOR"]),
  tagController.createNewTag
);

router.get(
  "/",
  authorizeRole(["ADMINISTRATOR", "AUTHOR", "EDITOR"]),
  tagController.getAllTags
);

export default router;
