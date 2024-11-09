"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blog_1 = __importDefault(require("../controllers/blog"));
const router = express_1.default.Router();
// CREATE
router.post("/", blog_1.default.createNewBlog);
// READ
router.get("/", blog_1.default.getAllBlogs);
// UPDATE
router.patch("/:id", blog_1.default.updateBlog);
// DELETE
router.delete("/:id", blog_1.default.deleteBlog);
exports.default = router;
