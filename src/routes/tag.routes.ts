import express from "express";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
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

router.get(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  tagController.getTagByID
);

router.patch("/:id", authorizeRole(["ADMINISTRATOR"]), tagController.updateTag);

router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "AUTHOR", "EDITOR"]),
  tagController.deleteTag
);

export default router;
