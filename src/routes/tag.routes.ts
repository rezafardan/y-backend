import express from "express";

// CONTROLLER
import tagController from "../controllers/tag.controller";

// MIDDLEWARE
import { authorizeRole } from "../middlewares/authorizeRole.middleware";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// CREATE A NEW TAG
//   POST RAW/JSON
//   http://hostname/api/tag
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR", "EDITOR"]),
  tagController.createNewTag
);

// READ ALL TAG DATA
//   http://hostname/api/tag
router.get(
  "/",
  authorizeRole(["ADMINISTRATOR", "AUTHOR", "EDITOR", "SUBSCRIBER"]),
  tagController.getAllTags
);

// READ TAG DATA BY ID
//   http://hostname/api/tag/ID?
router.get(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]),
  tagController.getTagByID
);

// UPDATE TAG DATA BY ID
//   http://hostname/api/tag/ID?
router.patch("/:id", authorizeRole(["ADMINISTRATOR"]), tagController.updateTag);

// DELETE TAG DATA BY ID
//   http://hostname/api/tag/ID?
router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR", "AUTHOR", "EDITOR"]),
  tagController.deleteTag
);

export default router;
