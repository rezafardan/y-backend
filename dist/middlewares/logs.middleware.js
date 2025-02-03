"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// LOGGER WINSTON
const logger_1 = __importDefault(require("../logs/logger"));
const logRequest = (req, res, next) => {
    logger_1.default.info(`Request: ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
};
exports.default = logRequest;
