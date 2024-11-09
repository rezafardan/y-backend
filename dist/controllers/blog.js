"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// CREATE
const createNewBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma.post.create({
        data: {
            title: "title testing",
            content: "content testing",
            main_image: "mainimage testing",
            created_at: new Date(),
            updated_at: new Date(),
            published_at: new Date(),
            view_count: 1,
            category_id: "tes1",
            user_id: "tes1",
        },
    });
    res.status(201).json({ data: result, message: "Blog created" });
});
// READ
const getAllBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma.post.findMany({
        select: {
            title: true,
            content: true,
        },
    });
    res.json({ data: result, message: "Blog lists" });
});
// UPDATE
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    res.json({ message: `Blog ${id} updated` });
});
// DELETE
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    res.json({ message: `Blog ${id} deleted` });
});
exports.default = { createNewBlog, getAllBlogs, updateBlog, deleteBlog };
