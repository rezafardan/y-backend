"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// MIDDLEWARE
const logs_middleware_1 = __importDefault(require("./middlewares/logs.middleware"));
const accessValidation_midlleware_1 = __importDefault(require("./middlewares/accessValidation.midlleware"));
// ROUTES
const administrator_routes_1 = __importDefault(require("./routes/administrator.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const tag_routes_1 = __importDefault(require("./routes/tag.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// MIDDLEWARE CROSS ORIGIN
app.use((0, cors_1.default)({
    origin: "https://y-dashboard-seven.vercel.app",
    credentials: true,
}));
// MIDDLEWARE HTTP COOKIES PARSER
app.use((0, cookie_parser_1.default)());
// MIDDLEWARE PARSING JSON
app.use(express_1.default.json());
// MIDDLEWARE LOG
app.use(logs_middleware_1.default);
// ROOT ROUTE WITHOUT VALIDATION
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
// MIDDLEWARE ACCESS ASSET FILES
app.use("/public", accessValidation_midlleware_1.default, express_1.default.static(path_1.default.resolve("public")));
// ROUTE LOGIN
app.use("/api", auth_routes_1.default);
// ROUTE USER
app.use("/api/user", accessValidation_midlleware_1.default, user_routes_1.default);
// ROUTE BLOG
app.use("/api/blog", accessValidation_midlleware_1.default, blog_routes_1.default);
// ROUTE CATEGORY
app.use("/api/category", accessValidation_midlleware_1.default, category_routes_1.default);
// ROUTE TAG
app.use("/api/tag", accessValidation_midlleware_1.default, tag_routes_1.default);
// CREATE ADMINISTRATOR USER
// COMMAND IF ADMINISTRATOR USER SUCCESSFULLY CREATED
app.use("/api/administrator", administrator_routes_1.default);
exports.default = app;
