import express from "express";
import administratorController from "../controllers/administrator.controller";

const router = express.Router();

// CREATE ADMINISTRATOR USER
router.post("/", administratorController.createAdministrator);

export default router;
