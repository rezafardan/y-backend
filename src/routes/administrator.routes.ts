import express from "express";

// CONTROLLER
import administratorController from "../controllers/administrator.controller";

// MIDDLEWARE
import { uploadProfile } from "../middlewares/upload.middleware";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// CREATE A NEW ADMINISTRATOR USER FOR EARLY PRODUCTION
//   POST MULTIPART/FORM-DATA
//   http://hostname/api/administrator
router.post(
  "/",
  uploadProfile.single("profileImage"),
  administratorController.createAdministrator
);

export default router;
