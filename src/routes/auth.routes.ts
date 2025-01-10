import express from "express";

// CONTROLLER
import authController from "../controllers/auth.controller";

// MIDDLEWARE
import accessValidation from "../middlewares/accessValidation.midlleware";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// LOGIN
//   http://hostname/api/login
router.post("/login", authController.Login);

// lOGOUT
//   http://hostname/api/logout
router.post("/logout", accessValidation, authController.Logout);

// AUTHENTICATION CHECK
//   http://hostname/api/auth/check
router.get("/auth/check", authController.authCheck);

export default router;
