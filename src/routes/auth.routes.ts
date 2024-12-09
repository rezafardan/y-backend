import express from "express";
import authController from "../controllers/auth.controller";
import { authorizeRole } from "../middleware/roleAuthorization.middleware";

const router = express.Router();

// LOGIN
router.post("/login", authController.Login);
// lOGOUT
router.post("/logout", authController.Logout);
// RESET PASSWORD
router.post(
  "/reset-password",
  authorizeRole(["ADMINISTRATOR"]),
  authController.ResetPassword
);

export default router;
