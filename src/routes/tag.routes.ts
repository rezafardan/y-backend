import express from "express";
import { authorizeRole } from "../middleware/roleAuthorization.middleware";
import tagController from "../controllers/tag.controller";

const router = express.Router();

router.post(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  tagController.createNewTag
);

router.get(
  "/",
  authorizeRole(["ADMINISTRATOR", "AUTHOR", "EDITOR", "SUBSCRIBER"]),
  tagController.getAllTags
);

router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "AUTHOR", "EDITOR"]),
  tagController.deleteTag
);

export default router;
