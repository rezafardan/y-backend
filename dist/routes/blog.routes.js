"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
const blog_controller_1 = __importDefault(require("../controllers/blog.controller"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = express_1.default.Router();
// CREATE
router.post("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), blog_controller_1.default.createNewBlog);
// POST IMAGE CONTENT
router.post("/content", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), upload_middleware_1.uploadContent.single("contentimage"), blog_controller_1.default.uploadBlogImage);
router.post("/coverimage", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), upload_middleware_1.uploadCover.single("coverimage"), blog_controller_1.default.uploadBlogImage);
// READ
router.get("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), blog_controller_1.default.getAllBlogs);
// READ BY ID
router.get("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), blog_controller_1.default.getBlogById);
// UPDATE
router.patch("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), blog_controller_1.default.updateBlog);
// DELETE
router.delete("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), blog_controller_1.default.deleteBlog);
exports.default = router;
