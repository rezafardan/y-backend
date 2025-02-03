"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// CONTROLLER
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
// MIDLLEWARE
const authorizeRole_middleware_1 = require("../middlewares/authorizeRole.middleware");
// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express_1.default.Router();
// CHECK TOTAL BLOG FROM SEVERAL CATEGORY
//   http://hostname/api/category/categories-with-blog-count
router.get("/categories-with-blog-count", category_controller_1.default.getCategoriesWithBlogCount);
// CREATE A NEW CATEGORY
//   POST RAW/JSON
//   http://hostname/api/category
router.post("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR"]), category_controller_1.default.createNewCategory);
// READ ALL CATEGORY DATA
//   http://hostname/api/category
router.get("/", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), category_controller_1.default.getAllCategories);
// READ CATEGORY DATA BY ID
//   http://hostname/api/category/ID?
router.get("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR", "AUTHOR", "SUBSCRIBER"]), category_controller_1.default.getCategoryByID);
// UPDATE CATEGORY DATA BY ID
//   http://hostname/api/category/ID?
router.patch("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR"]), category_controller_1.default.updateCategory);
// DELETE CATEGORY DATA BY ID
//   http://hostname/api/category/ID?
router.delete("/:id", (0, authorizeRole_middleware_1.authorizeRole)(["ADMINISTRATOR", "EDITOR"]), category_controller_1.default.deleteCategory);
exports.default = router;
