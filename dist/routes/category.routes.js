"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
const router = express_1.default.Router();
router.get("/categories-with-blog-count", category_controller_1.default.getCategoriesWithBlogCount);
// CREATE
router.post("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR"]), category_controller_1.default.createNewCategory);
// READ
router.get("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), category_controller_1.default.getAllCategories);
// READ BY ID
router.get("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), category_controller_1.default.getCategoryByID);
// UPDATE
router.patch("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR"]), category_controller_1.default.updateCategory);
// DELETE
router.delete("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR"]), category_controller_1.default.deleteCategory);
exports.default = router;
