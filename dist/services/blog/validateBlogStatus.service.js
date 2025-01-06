"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateBlogFields;
function validateBlogFields(reqBody, status) {
    const requiredFieldsForPublish = [
        "title",
        "coverImageId",
        "content",
        "categoryId",
        "tags",
    ];
    // Jika statusnya "DRAFT", izinkan content kosong
    if (status !== "DRAFT" && !reqBody.content) {
        throw new Error("Content cannot be empty");
    }
    // Validasi field yang diperlukan selain "DRAFT"
    const missingFields = requiredFieldsForPublish.filter((field) => status !== "DRAFT" && !reqBody[field]);
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields for ${status}: ${missingFields.join(", ")}`);
    }
    // Pastikan publishedAt ada untuk status "SCHEDULE"
    if (status === "SCHEDULE" && !reqBody.publishedAt) {
        throw new Error("Published date is required for SCHEDULE status.");
    }
}
