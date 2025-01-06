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
const prisma_1 = __importDefault(require("../models/prisma"));
const tag_service_1 = require("../services/blog/tag.service");
const contentImage_service_1 = require("../services/blog/contentImage.service");
const status_service_1 = require("../services/blog/status.service");
const validateBlogStatus_service_1 = __importDefault(require("../services/blog/validateBlogStatus.service"));
// CREATE
const createNewBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET USER ID DATA
        const userId = req.user.id;
        // GET BODY DATA
        const { title, slug, coverImageId, content, categoryId, tags, publishedAt, status, allowComment, } = req.body;
        console.log(req.body);
        try {
            (0, validateBlogStatus_service_1.default)(req.body, status);
        }
        catch (error) {
            return res.status(400).json({ message: "Error" });
        }
        if (!content) {
            return res.status(400).json({ message: "Content cannot be empty" });
        }
        const contentImageIds = (0, contentImage_service_1.extractContentImageIds)(JSON.parse(content));
        let publicationDate;
        try {
            publicationDate = (0, status_service_1.validateBlogStatus)(status, publishedAt);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
        const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Buat tags jika belum ada
            const allTagIds = yield (0, tag_service_1.createTags)(tags, userId, status);
            // Buat blog baru
            const createdBlog = yield prisma.blog.create({
                data: {
                    userId,
                    title,
                    slug,
                    coverImageId,
                    content: JSON.parse(content),
                    contentImages: {
                        connect: contentImageIds.map((id) => ({ id })),
                    },
                    categoryId,
                    tags: {
                        connect: allTagIds,
                    },
                    publishedAt: publicationDate,
                    status,
                    allowComment,
                },
            });
            // Update status 'isUsed' pada gambar yang digunakan (cover dan konten)
            if (status !== "DRAFT") {
                yield prisma.media.updateMany({
                    where: {
                        id: {
                            in: [coverImageId, ...contentImageIds], // Gabungkan cover dan gambar konten
                        },
                    },
                    data: {
                        isUsed: true,
                    },
                });
            }
            return createdBlog;
        }));
        return res
            .status(201)
            .json({ data: result, message: "Create a blog success!" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error creating blog", error });
    }
});
// CREATE
const uploadBlogImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET USER ID DATA
        const userId = req.user.id;
        // GET FILE DATA
        const { originalname, path, size } = req.file;
        const media = yield prisma_1.default.media.create({
            data: {
                filename: originalname,
                filepath: path,
                filesize: size,
                isUsed: false,
                userId,
            },
        });
        res
            .status(201)
            .json({ data: media, message: "Image uploaded successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "Error uploading image", error });
    }
});
// READ
const getAllBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.blog.findMany({
            select: {
                id: true,
                status: true,
                title: true,
                slug: true,
                content: true,
                coverImageId: true,
                coverImage: { select: { filepath: true } },
                allowComment: true,
                likeCount: true,
                viewCount: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                isUserActive: true,
                tags: true,
                category: true,
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
        return res
            .status(200)
            .json({ data: result, message: "Get all blogs success!" });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error when fetching blogs data", error });
    }
});
// READ BY ID
const getBlogById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield prisma_1.default.blog.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                title: true,
                slug: true,
                content: true,
                coverImageId: true,
                coverImage: { select: { filepath: true } },
                allowComment: true,
                likeCount: true,
                viewCount: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                isUserActive: true,
                tags: true,
                category: true,
                user: {
                    select: {
                        username: true,
                        role: true,
                        profileImage: true,
                        deletedAt: true,
                    },
                },
            },
        });
        return res
            .status(200)
            .json({ data: result, message: `Get blog by id: ${id} success` });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error when fetching blog data", error });
    }
});
// UPDATE
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, slug, coverImageId, content, categoryId, tags, status, allowComment, publishedAt, } = req.body;
        console.log(req.body);
        const tagIds = yield (0, tag_service_1.createTags)(tags, userId, status);
        const contentImageIds = (0, contentImage_service_1.extractContentImageIds)(JSON.parse(content));
        const result = yield prisma_1.default.blog.update({
            where: { id },
            data: {
                title,
                slug,
                coverImageId: coverImageId ? coverImageId : null,
                content: JSON.parse(content),
                contentImages: {
                    connect: contentImageIds.map((id) => ({ id })),
                },
                categoryId,
                tags: {
                    connect: tagIds,
                },
                status: status,
                allowComment,
                publishedAt,
            },
        });
        console.log("ini result", result);
        res
            .status(201)
            .json({ data: result, message: "Updating blog data success!" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating blog data", error });
    }
});
// DELETE
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield prisma_1.default.blog.delete({
            where: { id },
        });
        res.status(200).json({ message: "Deleting blog data success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting blog data", error });
    }
});
exports.default = {
    createNewBlog,
    uploadBlogImage,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
};
