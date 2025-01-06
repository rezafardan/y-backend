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
exports.createTags = void 0;
const prisma_1 = __importDefault(require("../../models/prisma"));
const createTags = (tags, userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Jika statusnya adalah "DRAFT" dan tags kosong, perbolehkan tag kosong
    if (status === "DRAFT" && (!tags || tags.length === 0)) {
        return [];
    }
    // SEPARATE NEW TAGS (WITHOUT ID) AND EXISTING TAGS (WITH ID)
    const newTags = tags.filter((tag) => !tag.id);
    const existingTags = tags.filter((tag) => tag.id);
    // IG TAG ID EMPTY, CREATE NEW TAG
    let createdTags = [];
    if (newTags.length > 0) {
        yield prisma_1.default.tag.createMany({
            data: newTags.map((tag) => ({
                name: tag.name,
                userId,
            })),
        });
        // SELECT ID FROM NEWLY CREATED TAG
        createdTags = yield prisma_1.default.tag.findMany({
            where: { name: { in: newTags.map((tag) => tag.name) } },
            select: { id: true },
        });
    }
    // COMBINE CREATED TAG IDS AND EXISTING TAG IDS
    return [
        ...existingTags.map((tag) => ({ id: tag.id })),
        ...createdTags,
    ];
});
exports.createTags = createTags;
