import express from "express";
import authController from "../controllers/auth";

const router = express.Router();

// LOGIN
router.post("/", authController.Login);

export default router;
