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
const bcrypt_1 = __importDefault(require("bcrypt"));
// FILE SYSTEM
const fs_1 = __importDefault(require("fs"));
//  GET USER DATA THAT LOGGED IN FOR VIEW USER PROFILE ACTION
const getLoggedInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET USER ID
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
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res
            .status(200)
            .json({ data: user, message: "Get data user logged in success!" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
});
// PATCH USER DATA THAT LOGGED IN FOR EDIT USER PROFILE ACTION
const updateLoggedInUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET USER ID
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }
        // GET BODY
        const { fullname, email, password, role } = req.body;
        const profileImage = req.file;
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // NEW DATA AND EXISTING DATA
        const updatedData = {
            fullname: fullname || existingUser.fullname,
            email: email || existingUser.email,
            role: role || existingUser.role,
            profileImage: (profileImage === null || profileImage === void 0 ? void 0 : profileImage.path) || existingUser.profileImage,
        };
        // NEW PASSWORD CREATE HASHING
        if (password) {
            const salt = yield bcrypt_1.default.genSalt(10);
            updatedData.passwordHash = yield bcrypt_1.default.hash(password, salt);
        }
        // DELETE PROFILE IMAGE IF THERE ARE PROFILE IMAGE IN DATABASE
        if (profileImage && existingUser.profileImage) {
            try {
                yield fs_1.default.promises.unlink(existingUser.profileImage);
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: "Error deleting profile image", error });
            }
        }
        // DATABASE CONNECTION WITH ORM
        const result = yield prisma_1.default.user.update({
            where: { id: userId },
            data: updatedData,
        });
        res
            .status(200)
            .json({ data: result, message: "User profile updated successfully!" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
});
// CREATE NEW USER
const createNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET BODY
        const { username, fullname, email, password, role } = req.body;
        const profileImage = req.file;
        // CHECK DUPLICATE EMAIL
        const emailValidation = yield prisma_1.default.user.findUnique({
            where: { email },
        });
        if (emailValidation) {
            return res.status(500).json({
                message: "Error creating user, email alredy exist, please change your email!",
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
            .json({ data: result, message: "Create a user success!" });
    }
    catch (error) {
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
        res.status(500).json({ message: "Internal server error", error });
    }
});
//  GET USER DATA BY ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET ID
        const { id } = req.params;
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
            .json({ data: result, message: `Get user by id: ${id} success!` });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
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
            passwordHash: existingUser.passwordHash,
        };
        // HASHING PASSWORD
        if (password) {
            const salt = yield bcrypt_1.default.genSalt(10);
            updatedData.passwordHash = yield bcrypt_1.default.hash(password, salt);
        }
        // DELETE PROFILE IMAGE IF THERE ARE PROFILE IMAGE IN DATABASE
        if (profileImage && existingUser.profileImage) {
            try {
                yield fs_1.default.promises.unlink(existingUser.profileImage);
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: "Error deleting profile image", error });
            }
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
        res.status(500).json({ message: "Internal server error", error });
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
        res.status(500).json({ message: "Internal server error", error });
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
        res.status(500).json({ message: "Internal server error", error });
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
        res.status(500).json({ message: "Internal server error", error });
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
exports.default = {
    getLoggedInUser,
    updateLoggedInUser,
    createNewUser,
    getAllUsers,
    getUserById,
    updateUser,
    softDeleteUser,
    deleteUserPermanent,
    restoreUserSoftDelete,
    checkUsername,
};
