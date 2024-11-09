"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logs_1 = __importDefault(require("./middlewares/logs"));
const blog_1 = __importDefault(require("./routes/blog"));
const app = (0, express_1.default)();
const PORT = 3001;
// MIDDLEWARE LOG
app.use(logs_1.default);
// ROUTE BLOG
app.use("/post", blog_1.default);
app.listen(PORT, () => {
    console.log(`Server running in PORT: ${PORT}`);
});
