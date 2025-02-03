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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ORN
const prisma_1 = __importDefault(require("../models/prisma"));
// CREATE NEW CATEGORY
const createNewCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET USER ID
        const userId = req.user.id;
        // GET BODY
        const { name, description } = req.body;
        // CHECK DUPLICATION CATEGORY NAME
        const existingCategory = yield prisma_1.default.category.findFirst({
            where: { name: name },
        });
        if (existingCategory) {
            return res.status(404).json({
                message: "Category with this name already exists. Please choose another name.",
            });
        }
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.category.create({
            data: {
                name,
                description,
                userId,
            },
        });
        res
            .status(201)
            .json({ data: result, message: "Category processed successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// GET ALL CATEGORY DATA
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.category.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                isUserActive: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        deletedAt: true,
                    },
                },
            },
        });
        res
            .status(200)
            .json({ data: result, message: "Get all categories success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// GET CATEGORY BY ID
const getCategoryByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.category.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                isUserActive: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        deletedAt: true,
                    },
                },
            },
        });
        res
            .status(200)
            .json({ data: result, message: `Get category by id: ${id} success` });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// UPDATE CATEGORY DATA BY ID
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // GET BODY
        const { name, description } = req.body;
        // CHECK DUPLICATION CATEGORY NAME
        const existingCategory = yield prisma_1.default.category.findFirst({
            where: { name: name },
        });
        if (existingCategory) {
            return res.status(404).json({
                message: "Category with this name already exists. Please choose another name.",
            });
        }
        // DATABASE CONNECTION
        const result = yield prisma_1.default.category.update({
            where: { id },
            data: {
                name,
                description,
            },
        });
        res
            .status(201)
            .json({ data: result, message: "Updating category data success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// DELETE CATEGORY DATA
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET UD
        const { id } = req.params;
        // CHECK IF CATEGORY STILL USED BY BLOG
        const categoryInUse = yield prisma_1.default.category.findUnique({
            where: { id },
            select: {
                Blogs: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        if (categoryInUse && categoryInUse.Blogs.length > 0) {
            // TOTAL BLOGS
            const blogCount = categoryInUse.Blogs.length;
            return res.status(400).json({
                message: `This category is still used in ${blogCount} blog${blogCount > 1 ? "s" : ""}. Cannot delete category.`,
            });
        }
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.category.delete({
            where: { id },
        });
        res
            .status(201)
            .json({ data: result, message: "Deleting category data success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
const getCategoriesWithBlogCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET CATEGORY DATA WITH TOTAL BLOGS PER CATEGORY
        const categories = yield prisma_1.default.category.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: { Blogs: true },
                },
            },
        });
        res.status(200).json({
            data: categories,
            message: "Fetched categories with blog count successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
exports.default = {
    createNewCategory,
    getCategoryByID,
    getAllCategories,
    updateCategory,
    deleteCategory,
    getCategoriesWithBlogCount,
};
