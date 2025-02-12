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
const logsError_middleware_1 = __importDefault(require("./middlewares/logsError.middleware"));
const accessValidation_midlleware_1 = __importDefault(require("./middlewares/accessValidation.midlleware"));
// ROUTES
const _root_routes_1 = __importDefault(require("./routes/_root.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const tag_routes_1 = __importDefault(require("./routes/tag.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const administrator_routes_1 = __importDefault(require("./routes/administrator.routes"));
// ENV
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
dotenv_1.default.config();
// ONLY DISABLE ON VERCEL PRODUCTION
// CREATE NEW FOLDERS FOR ASSETS
// initializeFolders();
// MIDDLEWARE CROSS ORIGIN
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
// SET PROXY CORS
app.set("trust proxy", true);
// MIDDLEWARE LOG
app.use(logs_middleware_1.default);
// ROOT ROUTE WITHOUT VALIDATION
app.get("/", _root_routes_1.default);
// MIDDLEWARE PARSING JSON
app.use(express_1.default.json());
// MIDDLEWARE HTTP COOKIES PARSER
app.use((0, cookie_parser_1.default)());
// MIDDLEWARE ACCESS ASSET FILES
app.use("/public", accessValidation_midlleware_1.default, express_1.default.static(path_1.default.resolve("public")));
// ROUTE LOGIN
app.use("/api", auth_routes_1.default);
// ROUTE USER
app.use("/api/user", accessValidation_midlleware_1.default, user_routes_1.default);
// ROUTE TAG
app.use("/api/tag", accessValidation_midlleware_1.default, tag_routes_1.default);
// ROUTE CATEGORY
app.use("/api/category", accessValidation_midlleware_1.default, category_routes_1.default);
// ROUTE BLOG
app.use("/api/blog", blog_routes_1.default); // accessValidation
// =============================== //
// CREATE ADMINISTRATOR USER
// COMMAND IF ADMINISTRATOR USER SUCCESSFULLY CREATED
app.use("/api/administrator", administrator_routes_1.default);
// =============================== //
// =============================== //
// ONLY USE ON DEVELOPMENT MODE
// DISABLE IF DEPLOY TO PRODUCTION
const PORT = "4000";
app.listen(PORT, () => {
    console.log(`Server running in PORT: ${PORT}`);
});
// =============================== //
// MIDDLEWARE LOG ERROR
app.use(logsError_middleware_1.default);
// export default app;
