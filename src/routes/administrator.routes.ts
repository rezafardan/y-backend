import express from "express";
import administratorController from "../controllers/administrator.controller";
import { uploadProfile } from "../middlewares/upload.middleware";
const router = express.Router();

// CREATE ADMINISTRATOR USER
router.post(
  "/",
  uploadProfile.single("profileImage"),
  administratorController.createAdministrator
);

export default router;
