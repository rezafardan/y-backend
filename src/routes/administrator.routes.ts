import express from "express";

// CONTROLLER
import administratorController from "../controllers/administrator.controller";

// MIDDLEWARE
import { uploadProfile } from "../middlewares/upload.middleware";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// CREATE A NEW ADMINISTRATOR USER
//   POST MULTIPART/FORM-DATA
//   http://hostname/api/administrator
// KEAMANAN: cuma ADMINISTRATOR yang sudah login yang boleh bikin administrator
// baru (accessValidation dipasang di index.ts sebelum route ini). Bootstrap
// administrator PERTAMA kali tidak lewat endpoint ini lagi, tapi otomatis
// lewat src/scripts/seedAdmin.ts saat container start.
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR"]),
  uploadProfile.single("profileImage"),
  administratorController.createAdministrator
);

export default router;
