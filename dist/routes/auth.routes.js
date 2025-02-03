"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// CONTROLLER
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
// MIDDLEWARE
const accessValidation_midlleware_1 = __importDefault(require("../middlewares/accessValidation.midlleware"));
// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express_1.default.Router();
// LOGIN
//   http://hostname/api/login
router.post("/login", auth_controller_1.default.Login);
// lOGOUT
//   http://hostname/api/logout
router.post("/logout", accessValidation_midlleware_1.default, auth_controller_1.default.Logout);
// AUTHENTICATION CHECK
//   http://hostname/api/auth/check
router.get("/auth/check", auth_controller_1.default.authCheck);
exports.default = router;
