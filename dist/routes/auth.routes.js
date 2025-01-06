"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
const accessValidation_midlleware_1 = __importDefault(require("../middlewares/accessValidation.midlleware"));
const router = express_1.default.Router();
// LOGIN
router.post("/login", auth_controller_1.default.Login);
// lOGOUT
router.post("/logout", accessValidation_midlleware_1.default, auth_controller_1.default.Logout);
// RESET PASSWORD
router.post("/reset-password", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), auth_controller_1.default.ResetPassword);
exports.default = router;
