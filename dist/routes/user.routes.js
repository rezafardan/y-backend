"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// CONTROLLER
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
// MIDDLEWARE
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express_1.default.Router();
// CHECK USER DATA BUT ONLY DATA USER LOGGED IN
//   http://hostname/api/user/me
router.get("/me", user_controller_1.default.getLoggedInUser);
// UPDATE USER DATA BUT ONLY DATA USER LOGGED IN
//   http://hostname/api/user/me
router.patch("/me", upload_middleware_1.uploadProfile.single("profileImage"), user_controller_1.default.updateLoggedInUser);
// CREATE A NEW USER
//   POST MULTIPART/FORM-DATA
//   http://hostname/api/user
router.post("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), upload_middleware_1.uploadProfile.single("profileImage"), user_controller_1.default.createNewUser);
// READ ALL USER DATA
//   http://hostname/api/user
router.get("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), user_controller_1.default.getAllUsers);
// READ USER DATA BY ID
//   http://hostname/api/user/ID?
router.get("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), user_controller_1.default.getUserById);
// UPDATE USER DATA BY ID
//   http://hostname/api/user/ID?
router.patch("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), (req, res, next) => {
    console.log("File:", req.file); // Cek file yang diterima
    console.log("Body:", req.body); // Cek data lainnya
    next();
}, upload_middleware_1.uploadProfile.single("profileImage"), user_controller_1.default.updateUser);
// SOFT DELETE USER DATA BY ID
//   http://hostname/api/user/ID?
router.patch("/softdelete/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), user_controller_1.default.softDeleteUser);
// RESTORE USER SOFT DELETE BY ID
//   http://hostname/api/user/ID?
router.patch("/restore/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), user_controller_1.default.restoreUserSoftDelete);
// PERMANENT DELETE USER DATA BY ID
//   http://hostname/api/user/ID?
router.delete("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), user_controller_1.default.deleteUserPermanent);
// CHECK USERNAME FOR CREATE A NEW USER DATA
//   http://hostname/api/user/check-username
router.post("/check-username", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), user_controller_1.default.checkUsername);
exports.default = router;
