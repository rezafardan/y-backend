"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const authorizeRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res
                .status(403)
                .json({ message: "Access denied. User not authenticated" });
            return;
        }
        if (user.deletedAt) {
            res.status(403).json({
                message: "User is inactive and cannot perform this action",
            });
            return;
        }
        if (!roles.includes(user.role)) {
            res.status(403).json({
                message: `You do not have permission to perform this action. Required role: ${roles.join(" or ")}`,
            });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
