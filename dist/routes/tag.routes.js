"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
const tag_controller_1 = __importDefault(require("../controllers/tag.controller"));
const router = express_1.default.Router();
router.post("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR"]), tag_controller_1.default.createNewTag);
router.get("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "AUTHOR", "EDITOR", "SUBSCRIBER"]), tag_controller_1.default.getAllTags);
router.get("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), tag_controller_1.default.getTagByID);
router.patch("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR"]), tag_controller_1.default.updateTag);
router.delete("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "AUTHOR", "EDITOR"]), tag_controller_1.default.deleteTag);
exports.default = router;
