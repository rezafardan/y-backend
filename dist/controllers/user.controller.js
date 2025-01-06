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
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
// ORM
const prisma_1 = __importDefault(require("../models/prisma"));
// CREATE
const createNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET BODY
        const { username, fullname, email, password, role } = req.body;
        const profileImage = req.file;
        // DATABASE CONNECTION WITH ORM
        const emailValidation = yield prisma_1.default.user.findUnique({
            where: { email },
        });
        if (emailValidation) {
            return res.status(500).json({
                message: "Error creating user, email alredy exist, please change your email",
            });
        }
        // HASHING PASSWORD
        const salt = yield bcrypt_1.default.genSalt(10);
        const passwordHash = yield bcrypt_1.default.hash(password, salt);
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.create({
            data: {
                username,
                fullname,
                email,
                passwordHash,
                role,
                profileImage: profileImage === null || profileImage === void 0 ? void 0 : profileImage.path,
                deletedAt: null,
            },
        });
        return res
            .status(201)
            .json({ data: result, message: "Create a user success" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error creating user", error });
    }
});
// GET ALL USER DATA
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.findMany({
            select: {
                id: true,
                username: true,
                fullname: true,
                email: true,
                role: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });
        res.status(200).json({ data: result, messsage: "Get all users success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Error when get users data", error });
    }
});
//  GET USER DATA BY ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        console.log(id);
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                fullname: true,
                email: true,
                role: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });
        res
            .status(200)
            .json({ data: result, message: `Get user by id: ${id} success` });
    }
    catch (error) {
        res.status(500).json({ message: "Error when get user data", error });
    }
});
// UPDATE USER DATA BY ID
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // GET BODY
        const { fullname, email, password, role } = req.body;
        const profileImage = req.file;
        const existingUser = yield prisma_1.default.user.findUnique({ where: { id } });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const updatedData = {
            fullname: fullname || existingUser.fullname,
            email: email || existingUser.email,
            role: role || existingUser.role,
            profileImage: (profileImage === null || profileImage === void 0 ? void 0 : profileImage.path) || existingUser.profileImage,
            passwordHash: existingUser.passwordHash, // Default old password
        };
        // HASHING PASSWORD
        if (password) {
            const salt = yield bcrypt_1.default.genSalt(10);
            updatedData.passwordHash = yield bcrypt_1.default.hash(password, salt);
        }
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.update({
            where: { id },
            data: updatedData,
        });
        res
            .status(201)
            .json({ data: result, message: "Updating user data success!" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating user data", error });
    }
});
//  SOFT DELETE USER DATA
const softDeleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.update({
            where: { id },
            data: { updatedAt: new Date(), deletedAt: new Date() },
        });
        // DATABASE CONNECTION WITH RELATION TO USER POST CATEGORY AND SET USER ACTIVE FALSE
        yield prisma_1.default.category.updateMany({
            where: { userId: id },
            data: { isUserActive: false },
        });
        // DATABASE CONNECTION WITH RELATION TO USER POST BLOG AND SET USER ACTIVE FALSE
        yield prisma_1.default.blog.updateMany({
            where: { userId: id },
            data: { isUserActive: false },
        });
        res.status(201).json({
            data: result,
            message: "User has been soft deleted successfully!",
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error when soft deleting user data", error });
    }
});
//  RESTORE USER DATA WHEN STATUS SOFT DELETE
const restoreUserSoftDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.update({
            where: { id },
            data: { deletedAt: null },
        });
        // DATABASE CONNECTION WITH RELATION TO USER POST CATEGORY AND SET USER ACTIVE FALSE
        yield prisma_1.default.category.updateMany({
            where: { userId: id },
            data: { isUserActive: true },
        });
        // DATABASE CONNECTION WITH RELATION TO USER POST BLOG AND SET USER ACTIVE FALSE
        yield prisma_1.default.blog.updateMany({
            where: { userId: id },
            data: { isUserActive: true },
        });
        res.status(201).json({
            data: result,
            message: "User has been restore successfully!",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error when restoring user data", error });
    }
});
//  PERMANTENT DELETE USER DATA
const deleteUserPermanent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
        // GET PROFILE IMAGE
        const user = yield prisma_1.default.user.findUnique({
            where: { id },
            select: { profileImage: true },
        });
        // IF ID NOT FOUND RETURN ERROR
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // DELETE PROFILE IMAGE IF THERE ARE PROFILE IMAGE IN DATABASE
        if (user.profileImage) {
            try {
                yield fs_1.default.promises.unlink(user.profileImage);
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: "Error deleting profile image", error });
            }
        }
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ data: result, message: "Deleting user data success!" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting user data", error });
    }
});
// CHECK USERNAME FOR CREATE A NEW USER TO AVOID DUPLICATE USER DATA
const checkUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET BODY
        const { username } = req.body;
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.findUnique({
            where: { username },
        });
        if (result) {
            return res.status(200).json({ isAvailable: false });
        }
        return res.status(200).json({ isAvailable: true });
    }
    catch (error) {
        return res.status(500).json({ isAvailable: false });
    }
});
//  GET USER DATA THAT LOGGED IN FOR VIEW  USER PROFILE ACTION
const getLoggedInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ambil id dari req.user yang telah diverifikasi oleh accessValidation
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }
        // DATABASE CONNECTION WITH ORM
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                fullname: true,
                email: true,
                profileImage: true,
                role: true,
            },
        });
        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Kirim response dengan data user
        return res
            .status(200)
            .json({ data: user, message: "Get data user logged in success!" });
    }
    catch (error) {
        console.error("Error getting user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
// PATCH USER DATA THAT LOGGED IN FOR EDIT USER PROFILE ACTION
const updateLoggedInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }
        const { fullname, email, password, role } = req.body;
        const profileImage = req.file;
        // Mendapatkan data user yang ada
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const updatedData = {
            fullname: fullname || existingUser.fullname,
            email: email || existingUser.email,
            role: role || existingUser.role,
            profileImage: (profileImage === null || profileImage === void 0 ? void 0 : profileImage.path) || existingUser.profileImage,
        };
        // Jika password ada, hash password baru
        if (password) {
            const salt = yield bcrypt_1.default.genSalt(10);
            updatedData.passwordHash = yield bcrypt_1.default.hash(password, salt);
        }
        // Update user di database
        const result = yield prisma_1.default.user.update({
            where: { id: userId },
            data: updatedData,
        });
        res
            .status(200)
            .json({ data: result, message: "User profile updated successfully!" });
    }
    catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = {
    createNewUser,
    getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser,
    deleteUserPermanent,
    restoreUserSoftDelete,
    checkUsername,
    getLoggedInUser,
    updateLoggedInUser,
};
