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
// FILE SYSTEM AND FILE PATH
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// SERVICE
const validateBlogFields_service_1 = require("../services/blog/validateBlogFields.service");
const extractContentImage_service_1 = require("../services/blog/extractContentImage.service");
const validateBlogStatus_service_1 = require("../services/blog/validateBlogStatus.service");
const createTag_service_1 = require("../services/blog/createTag.service");
// UPLOADING IMAGE COVER AND IMAGE CONTENT
const uploadBlogImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET USER ID DATA
        const userId = req.user.id;
        // GET FILE DATA
        const { originalname, path, size } = req.file;
        // DATABASE CONNECTION WITH ORM
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
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// CREATE NEW BLOG
const createNewBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET USER ID DATA
        const userId = req.user.id;
        // GET BODY DATA
        const { title, slug, coverImageId, content, categoryId, tags, status, publishedAt, allowComment, } = req.body;
        // VALIDATE BLOG FIELD
        yield (0, validateBlogFields_service_1.validateBlogFields)(req.body, status);
        // EXTRACT IMAGE CONTENT
        const contentImageIds = (0, extractContentImage_service_1.extractContentImageIds)(JSON.parse(content));
        // VALIDATE EXISTING IMAGE IDS
        const existingContentImages = yield prisma_1.default.media.findMany({
            where: { id: { in: contentImageIds } },
        });
        if (existingContentImages.length !== contentImageIds.length) {
            return res.status(400).json({
                message: "Some content image IDs do not exist in the Media table.",
            });
        }
        // SET PUBLISH DATE
        let publicationDate;
        try {
            publicationDate = (0, validateBlogStatus_service_1.validateBlogStatusForPulication)(status, publishedAt);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // CREATE NEW TAG IF IT DOESN'T EXIST YET
            const allTagIds = yield (0, createTag_service_1.createTags)(tags, userId, status);
            // CREATE NEW BLOG
            const createdBlog = yield prisma.blog.create({
                data: {
                    userId,
                    title,
                    slug,
                    coverImageId,
                    content: JSON.parse(content),
                    categoryId,
                    tags: {
                        create: allTagIds.map((tag) => ({
                            tag: { connect: { id: tag.id } },
                        })),
                    },
                    status,
                    publishedAt: publicationDate,
                    allowComment,
                },
            });
            // CONNECTING RELATIONAL IMAGE COVER AND IMAGE CONTENT TO BLOG
            yield prisma.blogContentImage.createMany({
                data: contentImageIds.map((imageId) => ({
                    blogId: createdBlog.id,
                    mediaId: imageId,
                })),
            });
            // UPDATE STATUS IMAGE TO ISUSED ON IMAGE USE (COVER AND CONTENT)
            if (status !== "DRAFT") {
                yield prisma.media.updateMany({
                    where: {
                        id: {
                            in: [coverImageId, ...contentImageIds],
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
            .json({ data: result, message: "Blog processed successfully!" });
    }
    catch (error) {
        if (error.message) {
            return res.status(400).json({ message: error.message });
        }
        return res
            .status(500)
            .json({ message: `Internal server error. ${error.message}` });
    }
});
// GET ALL BLOG DATA
const getAllBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.blog.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                coverImageId: true,
                coverImage: { select: { filepath: true } },
                content: true,
                category: true,
                tags: true,
                status: true,
                publishedAt: true,
                allowComment: true,
                likeCount: true,
                viewCount: true,
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
        return res
            .status(200)
            .json({ data: result, message: "Get all blogs success!" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error.", error });
    }
});
//  GET BLOG DATA BY ID
const getBlogById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.blog.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                coverImageId: true,
                coverImage: { select: { filepath: true } },
                category: true,
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                status: true,
                publishedAt: true,
                allowComment: true,
                likeCount: true,
                viewCount: true,
                createdAt: true,
                updatedAt: true,
                isUserActive: true,
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
        return res.status(500).json({ message: "Internal server error.", error });
    }
});
// UPDATE BLOG DATA BY ID
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET USER ID DATA
        const userId = req.user.id;
        // GET ID
        const { id } = req.params;
        // GET BODY
        const { title, slug, coverImageId, content, categoryId, tags, status, publishedAt, allowComment, } = req.body;
        // VALIDATE BLOG FIELDS
        yield (0, validateBlogFields_service_1.validateBlogFields)(req.body, status, id);
        // EXTRACT IMAGE CONTENT
        const contentImageIds = (0, extractContentImage_service_1.extractContentImageIds)(JSON.parse(content));
        // VALIDATE EXISTING IMAGE IDS
        const existingContentImages = yield prisma_1.default.media.findMany({
            where: { id: { in: contentImageIds } },
        });
        if (existingContentImages.length !== contentImageIds.length) {
            return res.status(400).json({
                message: "Some content image IDs do not exist in the Media table.",
            });
        }
        // SET PUBLISH DATE
        let publicationDate;
        try {
            publicationDate = (0, validateBlogStatus_service_1.validateBlogStatusForPulication)(status, publishedAt);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
        // DATABASE TRANSACTION
        const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // CREATE NEW TAGS IF NOT EXIST
            const allTagIds = yield (0, createTag_service_1.createTags)(tags, userId, status);
            // UPDATE BLOG DATA
            const updatedBlog = yield prisma.blog.update({
                where: { id },
                data: {
                    title,
                    slug,
                    coverImageId: coverImageId ? coverImageId : null,
                    content: JSON.parse(content),
                    categoryId,
                    tags: {
                        deleteMany: {}, // Remove existing tags
                        create: allTagIds.map((tag) => ({
                            tag: { connect: { id: tag.id } },
                        })),
                    },
                    status: status,
                    allowComment,
                    publishedAt: publicationDate,
                },
            });
            // UPDATE CONTENT IMAGE RELATIONS
            yield prisma.blogContentImage.deleteMany({ where: { blogId: id } });
            yield prisma.blogContentImage.createMany({
                data: contentImageIds.map((imageId) => ({
                    blogId: id,
                    mediaId: imageId,
                })),
            });
            // UPDATE MEDIA STATUS
            yield prisma.media.updateMany({
                where: {
                    id: { in: [coverImageId, ...contentImageIds] },
                },
                data: { isUsed: status !== "DRAFT" },
            });
            return updatedBlog;
        }));
        res
            .status(201)
            .json({ data: result, message: "Updating blog data success!" });
    }
    catch (error) {
        if (error.message) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error.", error });
    }
});
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // GET BLOG DATA AND MEDIA CAN RELATE
        const blog = yield prisma_1.default.blog.findUnique({
            where: { id },
            include: {
                coverImage: true,
                contentImages: { select: { media: true } },
            },
        });
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        // DELETE COVER IMAGE IF EXISTS
        if (blog.coverImage && blog.coverImage.filepath) {
            const coverImagePath = path_1.default.join(process.cwd(), "public/assets/blog", path_1.default.basename(blog.coverImage.filepath));
            try {
                if (fs_1.default.existsSync(coverImagePath)) {
                    yield fs_1.default.promises.unlink(coverImagePath);
                }
            }
            catch (err) {
                console.error("Error deleting cover image:", err);
            }
        }
        // DELETE CONTENT IMAGES IF EXIST
        if (blog.contentImages && blog.contentImages.length > 0) {
            for (const contentImage of blog.contentImages) {
                if (!contentImage.media.filepath)
                    continue;
                const contentImagePath = path_1.default.join(process.cwd(), "public/assets/blog/content", path_1.default.basename(contentImage.media.filepath));
                try {
                    if (fs_1.default.existsSync(contentImagePath)) {
                        yield fs_1.default.promises.unlink(contentImagePath);
                    }
                }
                catch (err) {
                    console.error("Error deleting content image:", err);
                }
            }
        }
        // DELETE MEDIA FROM DATABASE
        const mediaIds = [
            (_a = blog.coverImage) === null || _a === void 0 ? void 0 : _a.id,
            ...blog.contentImages.map((c) => c.media.id),
        ].filter(Boolean);
        if (mediaIds.length > 0) {
            yield prisma_1.default.media.deleteMany({
                where: { id: { in: mediaIds } },
            });
        }
        // DELETE BLOG FROM DATABASE
        yield prisma_1.default.blog.delete({
            where: { id },
        });
        res.status(200).json({
            message: "Blog and associated images deleted successfully!",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", error });
    }
});
exports.default = {
    uploadBlogImage,
    createNewBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
};
