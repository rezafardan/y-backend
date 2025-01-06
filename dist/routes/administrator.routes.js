"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const administrator_controller_1 = __importDefault(require("../controllers/administrator.controller"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = express_1.default.Router();
// CREATE ADMINISTRATOR USER
router.post("/", upload_middleware_1.uploadProfile.single("profileImage"), administrator_controller_1.default.createAdministrator);
exports.default = router;
