import express from "express";
import authController from "../controllers/auth.controller";

const router = express.Router();

// LOGIN
router.post("/login", authController.Login);
// lOGOUT
router.post("/logout", authController.Logout);

export default router;
