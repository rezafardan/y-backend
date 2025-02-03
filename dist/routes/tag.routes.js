"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// CONTROLLER
const tag_controller_1 = __importDefault(require("../controllers/tag.controller"));
// MIDDLEWARE
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express_1.default.Router();
// CREATE A NEW TAG
//   POST RAW/JSON
//   http://hostname/api/tag
router.post("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR"]), tag_controller_1.default.createNewTag);
// READ ALL TAG DATA
//   http://hostname/api/tag
router.get("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "AUTHOR", "EDITOR", "SUBSCRIBER"]), tag_controller_1.default.getAllTags);
// READ TAG DATA BY ID
//   http://hostname/api/tag/ID?
router.get("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), tag_controller_1.default.getTagByID);
// UPDATE TAG DATA BY ID
//   http://hostname/api/tag/ID?
router.patch("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), tag_controller_1.default.updateTag);
// DELETE TAG DATA BY ID
//   http://hostname/api/tag/ID?
router.delete("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "AUTHOR", "EDITOR"]), tag_controller_1.default.deleteTag);
exports.default = router;
