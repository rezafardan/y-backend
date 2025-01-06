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
exports.processTag = void 0;
// services/tagService.ts
const prisma_1 = __importDefault(require("../../models/prisma"));
// Process individual tag
const processTag = (tag, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!tag.name || typeof tag.name !== "string") {
        throw new Error("Each tag must have a valid 'name'.");
    }
    // Check if tag ID exists
    if (tag.id) {
        const existingTag = yield prisma_1.default.tag.findUnique({
            where: { id: tag.id },
        });
        if (!existingTag) {
            throw new Error(`Tag with ID ${tag.id} does not exist.`);
        }
        return existingTag;
    }
    // Check for duplicate name
    const existingTagByName = yield prisma_1.default.tag.findFirst({
        where: { name: tag.name },
    });
    if (existingTagByName) {
        throw new Error(`Tag with name \"${tag.name}\" already exists.`);
    }
    // Create new tag
    const newTag = yield prisma_1.default.tag.create({
        data: {
            name: tag.name,
            userId,
        },
    });
    return newTag;
});
exports.processTag = processTag;
