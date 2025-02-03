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
//  CREATE NEW TAG
const createNewTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET BODY
        const { tags } = req.body;
        // USER VALIDATION
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ message: "Unauthorized access." });
        }
        // TAGS FORMAT VALIDATION
        if (!Array.isArray(tags)) {
            return res
                .status(400)
                .json({ message: "Tags must be an array of objects." });
        }
        const processedTags = [];
        for (const tag of tags) {
            // VALIDATE TAG FORMAT
            if (!tag.name || typeof tag.name !== "string") {
                return res.status(400).json({
                    message: `Each tag must have a valid 'name'. Invalid tag: ${JSON.stringify(tag)}`,
                });
            }
            // CHECK EXISTING TAG ID
            if (tag.id) {
                const existingTag = yield prisma_1.default.tag.findUnique({
                    where: { id: tag.id },
                });
                if (!existingTag) {
                    return res
                        .status(404)
                        .json({ message: `Tag with ID ${tag.id} does not exist.` });
                }
                processedTags.push(existingTag);
                continue;
            }
            // CHECK DUPLICATION TAG NAME
            const existingTagByName = yield prisma_1.default.tag.findFirst({
                where: { name: tag.name },
            });
            if (existingTagByName) {
                return res.status(400).json({
                    message: `Tag with name "${tag.name}" already exists. Please choose another name.`,
                });
            }
            // CREATE NEW TAG
            const newTag = yield prisma_1.default.tag.create({
                data: {
                    name: tag.name,
                    userId: user.id,
                },
            });
            processedTags.push(newTag);
        }
        res
            .status(201)
            .json({ data: processedTags, message: "Tags processed successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// GET ALL TAG DATA
const getAllTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // DATABASE CONNECTION WITH ORM
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
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// GET TAG DATA BY ID
const getTagByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.tag.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
            },
        });
        res
            .status(200)
            .json({ data: result, message: `Get tag by id: ${id} success!` });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// UPDATE TAG DATA BY ID
const updateTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // GET BODY
        const { name } = req.body;
        // CHECK DUPLICATION TAG NAME
        const existingTag = yield prisma_1.default.tag.findUnique({
            where: { name },
        });
        if (existingTag) {
            return res.status(400).json({
                message: "Tag with this name already exists. Please choose another name.",
            });
        }
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.tag.update({
            where: { id },
            data: {
                name,
            },
        });
        res
            .status(201)
            .json({ data: result, message: "Updating tag data success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
// DELETE TAG DATA
const deleteTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // CHECK IF TAG STILL USED BY BLOG
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
            // TOTAL BLOGS
            const blogCount = tagInUse.blogs.length;
            return res.status(400).json({
                message: `This tag is still used in ${blogCount} blog${blogCount > 1 ? "s" : ""}. Cannot delete tag.`,
            });
        }
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.tag.delete({
            where: { id },
        });
        res.status(200).json({ message: "Deleting tag data success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error.", error });
    }
});
exports.default = {
    createNewTag,
    getAllTags,
    getTagByID,
    updateTag,
    deleteTag,
};
