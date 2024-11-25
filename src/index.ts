import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import logRequest from "./middleware/logs.middleware";
import accessValidation from "./middleware/accessValidation.midlleware";
import authRoutes from "./routes/auth.routes";
import blogRoutes from "./routes/blog.routes";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import administratorRoutes from "./routes/administrator.routes";

const app = express();
const PORT = 3001;

// MIDDLEWARE CROSS ORIGIN
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// MIDDLEWARE HTTP COOKIES PARSER
app.use(cookieParser());

// MIDDLEWARE PARSING JSON
app.use(express.json());

// MIDDLEWARE LOG
app.use(logRequest);

// MIDDLEWARE ACCESS DATA FILE
app.use("/public", accessValidation, express.static(path.resolve("public")));

// ROUTE LOGIN
app.use("/api/", authRoutes);

// ROUTE USER
app.use("/api/user", accessValidation, userRoutes);

// ROUTE BLOG
app.use("/api/blog", accessValidation, blogRoutes);

// ROUTE CATEGORY
app.use("/api/category", accessValidation, categoryRoutes);

// CREATE ADMINISTRATOR USER
// COMMAND IF ADMINISTRATOR USER SUCCESSFULLY CREATED
app.use("/api/administrator", administratorRoutes);

app.listen(PORT, () => {
  console.log(`Server running in PORT: ${PORT}`);
});
