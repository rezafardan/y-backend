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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // GET BODY
        const { username, password } = req.body;
        // USERNAME AND PASSWORD VALIDATION
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password are required" });
        }
        // DATABASE CONNECTION
        const result = yield prisma_1.default.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                role: true,
                passwordHash: true,
                profileImage: true,
                deletedAt: true,
            },
        });
        if (!result) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        // PASSWORD VALIDATION
        if (!result || !result.passwordHash) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const passwordCompare = yield bcrypt_1.default.compare(password, result.passwordHash);
        if (!passwordCompare) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        // USER ACTIVE OR INACTIVE VALIDATION
        if (result.deletedAt !== null) {
            return res
                .status(403)
                .json({ message: "User is inactive or does not exist." });
        }
        // CREATE TOKEN JWT
        const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
        if (!ACCESS_TOKEN_SECRET) {
            return res
                .status(500)
                .json({ message: "Server error: please contact an administrator" }); // JWT secret is not set
        }
        const accessToken = jsonwebtoken_1.default.sign({
            id: result.id,
            username: result.username,
            role: result.role,
            deletedAt: result.deletedAt,
        }, ACCESS_TOKEN_SECRET, {
            expiresIn: "1d",
        });
        // SEND RESPONSE HTTP COOKIES FOR TOKEN VALIDATION
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only true for production (HTTPS)
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "None" for cross-site cookies, "Lax" for same-site
            maxAge: 24 * 60 * 60 * 1000, // 1 day (in milliseconds)
        });
        return res.status(200).json({
            redirect: "/",
            message: `Login success, Welcome ${result.username}`,
            user: {
                id: result.id,
                username: result.username,
                role: result.role,
                profileImage: result.profileImage,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error when trying to login", error });
    }
});
const Logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear cookies
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        return res.status(200).json({ message: "Logout successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error during logout", error });
    }
});
const authCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "No token provided" });
        }
        const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
        if (!ACCESS_TOKEN_SECRET) {
            return res.status(500).json({
                message: "Server error: please contact an administrator",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(accessToken, ACCESS_TOKEN_SECRET);
        const user = yield prisma_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                role: true,
                profileImage: true,
                deletedAt: true,
            },
        });
        if (!user || user.deletedAt !== null) {
            return res.status(401).json({
                message: "User is inactive or does not exist",
            });
        }
        return res.status(200).json({
            authenticated: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error checking authentication status",
            error,
        });
    }
});
exports.default = { Login, Logout, authCheck };
