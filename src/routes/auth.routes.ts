import express from "express";
import authController from "../controllers/auth.controller";
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import accessValidation from "../middlewares/accessValidation.midlleware";

const router = express.Router();

// LOGIN
router.post("/login", authController.Login);

// lOGOUT
router.post("/logout", accessValidation, authController.Logout);

// RESET PASSWORD
router.post(
  "/reset-password",
  authorizeRole(["ADMINISTRATOR"]),
  authController.ResetPassword
);

export default router;
