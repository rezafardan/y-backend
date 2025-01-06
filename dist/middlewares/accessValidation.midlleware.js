"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// MIDDLEWARE TO AUTHENTICATION ACCESS VALIDATION BY TOKEN
// IF USER CREATE A REQUEST WITHOUT TOKEN, REQUEST CAN BE DROP OR REJECT
const accessValidation = (req, res, next) => {
    var _a;
    // GET HTTP COOKIES
    const accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    if (!accessToken) {
        res.status(401).json({ message: "Authentication token is missing" });
        return;
    }
    try {
        const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
        if (!ACCESS_TOKEN_SECRET) {
            res.status(500).json({ message: "JWT secret is not set" });
            return;
        }
        // DECODE JWT TOKEN
        const decode = jsonwebtoken_1.default.verify(accessToken, ACCESS_TOKEN_SECRET);
        req.user = { id: decode.id, username: decode.username, role: decode.role };
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid token" });
        return;
    }
};
exports.default = accessValidation;
