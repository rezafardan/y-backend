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
// ORM
const prisma_1 = __importDefault(require("../models/prisma"));
const processTag_service_1 = require("../services/tag/processTag.service");
//  CREATE
const createNewTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET BODY
        const { tags } = req.body;
        // Validasi pengguna
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ message: "Unauthorized access." });
        }
        // Validasi format tags
        if (!Array.isArray(tags)) {
            return res
                .status(400)
                .json({ message: "Tags must be an array of objects." });
        }
        const processedTags = yield Promise.all(tags.map((tag) => (0, processTag_service_1.processTag)(tag, user.id)));
        res
            .status(201)
            .json({ data: processedTags, message: "Tags processed successfully." });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: error.message || "Internal server error." });
    }
});
const getAllTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.tag.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });
        res.status(200).json({ data: result, message: "Get all tags success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Error when fetching tags data", error });
    }
});
const deleteTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Cek apakah tag masih digunakan oleh blog
        const tagInUse = yield prisma_1.default.tag.findUnique({
            where: { id },
            select: {
                blogs: {
                    select: {
                        blogId: true,
                        blog: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
            },
        });
        if (tagInUse && tagInUse.blogs.length > 0) {
            // Mengambil judul blog pertama yang menggunakan tag
            const blogCount = tagInUse.blogs.length;
            return res.status(400).json({
                message: `This tag is still used in ${blogCount} blog${blogCount > 1 ? "s" : ""}. Cannot delete tag.`,
            });
        }
        const result = yield prisma_1.default.tag.delete({
            where: { id },
        });
        res.status(200).json({ message: "Deleting tag data success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting tag data", error });
    }
});
const getTagByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // DATABASE CONNECTION
        const result = yield prisma_1.default.tag.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
            },
        });
        res
            .status(200)
            .json({ data: result, message: `Get tag by id: ${id} success` });
    }
    catch (error) {
        res.status(500).json({ message: "Error when fetching tag data", error });
    }
});
const updateTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // GET BODY
        const { name } = req.body;
        // DATABASE CONNECTION
        const result = yield prisma_1.default.tag.update({
            where: { id },
            data: {
                name,
            },
        });
        res
            .status(201)
            .json({ data: result, message: "Updating category data success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating category data", error });
    }
});
exports.default = {
    createNewTag,
    getAllTags,
    deleteTag,
    getTagByID,
    updateTag,
};
