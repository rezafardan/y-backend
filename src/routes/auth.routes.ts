import express from "express";
import authController from "../controllers/auth.controller";
import { authorizeRole } from "../middleware/roleAuthorization.middleware";
import accessValidation from "../middleware/accessValidation.midlleware";

const router = express.Router();

// LOGIN
router.post("/login", authController.Login);

router.post("/refresh-token", authController.RefreshToken);
// lOGOUT
router.post("/logout", accessValidation, authController.Logout);

// RESET PASSWORD
router.post(
  "/reset-password",
  authorizeRole(["ADMINISTRATOR"]),
  authController.ResetPassword
);

export default router;
