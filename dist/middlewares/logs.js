"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logRequest = (req, res, next) => {
    console.log(`Log request terjadi request di PATH: ${req.path}`);
    next();
};
exports.default = logRequest;
