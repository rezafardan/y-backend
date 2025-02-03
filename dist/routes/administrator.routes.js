"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// CONTROLLER
const administrator_controller_1 = __importDefault(require("../controllers/administrator.controller"));
// MIDDLEWARE
const upload_middleware_1 = require("../middlewares/upload.middleware");
// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express_1.default.Router();
// CREATE A NEW ADMINISTRATOR USER FOR EARLY PRODUCTION
//   POST MULTIPART/FORM-DATA
//   http://hostname/api/administrator
router.post("/", upload_middleware_1.uploadProfile.single("profileImage"), administrator_controller_1.default.createAdministrator);
exports.default = router;
