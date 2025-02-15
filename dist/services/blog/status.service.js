"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlogStatus = void 0;
const validateBlogStatus = (status, publishedAt) => {
    if (!["DRAFT", "PUBLISH", "SCHEDULE"].includes(status)) {
        throw new Error("Invalid blog status.");
    }
    if (status === "PUBLISH" || status === "SCHEDULE") {
        if (!publishedAt) {
            throw new Error("Published or scheduled blogs must have a publication date.");
        }
        const publicationDate = new Date(publishedAt);
        const now = new Date();
        // Aturan validasi tanggal: tidak lebih dari 30 hari kebelakang
        const maxBackDate = new Date();
        maxBackDate.setDate(now.getDate() - 30);
        if (publicationDate < maxBackDate) {
            throw new Error(`The publication date cannot be earlier than ${maxBackDate.toISOString().split("T")[0]}.`);
        }
        return publicationDate;
    }
    return null;
};
exports.validateBlogStatus = validateBlogStatus;
