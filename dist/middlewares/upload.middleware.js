"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfile = exports.uploadContent = exports.uploadCover = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const createStorage = (folder) => {
    return multer_1.default.diskStorage({
        destination(req, file, callback) {
            callback(null, `public/assets/${folder}`);
        },
        filename(req, file, callback) {
            const randomId = crypto_1.default.randomBytes(16).toString("hex");
            const fileExtension = path_1.default.extname(file.originalname);
            const fileName = `${randomId}${fileExtension}`;
            console.log(file);
            callback(null, fileName);
        },
    });
};
exports.uploadCover = (0, multer_1.default)({
    storage: createStorage("blog"),
});
exports.uploadContent = (0, multer_1.default)({
    storage: createStorage("blog/content"),
});
exports.uploadProfile = (0, multer_1.default)({
    storage: createStorage("profile-image"),
});
