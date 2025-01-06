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
const bcrypt_1 = __importDefault(require("bcrypt"));
// CREATE ADMINISTRATOR USER
const createAdministrator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET BODY
        const { username, fullname, email, password } = req.body;
        const profileImage = req.file;
        // HASHING PASSWORD
        const salt = yield bcrypt_1.default.genSalt(10);
        const passwordHash = yield bcrypt_1.default.hash(password, salt);
        // DATABASE CONNECTION WITH SCHEMA
        const result = yield prisma_1.default.user.create({
            data: {
                username,
                fullname,
                email,
                passwordHash,
                role: "ADMINISTRATOR",
                profileImage: profileImage === null || profileImage === void 0 ? void 0 : profileImage.path,
                deletedAt: null,
            },
        });
        return res
            .status(201)
            .json({ data: result, message: "Create a user success" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error creating user", error });
    }
});
exports.default = { createAdministrator };
