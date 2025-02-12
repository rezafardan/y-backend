"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// CONTROLLER
const blog_controller_1 = __importDefault(require("../controllers/blog.controller"));
// MIDDLEWARE
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const imageCompression_middleware_1 = __importDefault(require("../middlewares/imageCompression.middleware"));
// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express_1.default.Router();
// CREATE A NEW BLOG
//   POST MULTIPART/FORM-DATA
//   http://hostname/api/blog
router.post("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), blog_controller_1.default.createNewBlog);
// POST IMAGE CONTENT
//   http://hostname/api/blog/content
router.post("/contentimage", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), upload_middleware_1.uploadContent.single("contentimage"), (0, imageCompression_middleware_1.default)("blog/content"), blog_controller_1.default.uploadBlogImage);
// POST IMAGE COVER
//   http://hostname/api/blog/coverimage
router.post("/coverimage", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), upload_middleware_1.uploadCover.single("coverimage"), (0, imageCompression_middleware_1.default)("blog"), blog_controller_1.default.uploadBlogImage);
// READ ALL BLOG DATA
//   http://hostname/api/blog
router.get("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), blog_controller_1.default.getAllBlogs);
// READ BLOG DATA BY ID
//   http://hostname/api/blog/ID?
router.get("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), blog_controller_1.default.getBlogById);
// UPDATE BLOG DATA BY ID
//   http://hostname/api/blog/ID?
router.patch("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), blog_controller_1.default.updateBlog);
// DELETE BLOG DATA BY ID
//   http://hostname/api/blog/ID?
router.delete("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR"]), blog_controller_1.default.deleteBlog);
exports.default = router;
