import express from "express";

import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

// MIDDLEWARE
import logRequest from "./middlewares/logs.middleware";
import accessValidation from "./middlewares/accessValidation.midlleware";

// ROUTES
import administratorRoutes from "./routes/administrator.routes";
import authRoutes from "./routes/auth.routes";
import blogRoutes from "./routes/blog.routes";
import categoryRoutes from "./routes/category.routes";
import tagRoutes from "./routes/tag.routes";
import userRoutes from "./routes/user.routes";

import dotenv from "dotenv";

dotenv.config();

const app = express();

// MIDDLEWARE CROSS ORIGIN
app.use(
  cors({
    origin: "https://y-dashboard-seven.vercel.app",
    credentials: true,
  })
);

// MIDDLEWARE HTTP COOKIES PARSER
app.use(cookieParser());

// MIDDLEWARE PARSING JSON
app.use(express.json());

// MIDDLEWARE LOG
app.use(logRequest);

// ROOT ROUTE WITHOUT VALIDATION
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// MIDDLEWARE ACCESS ASSET FILES
app.use("/public", accessValidation, express.static(path.resolve("public")));

// ROUTE LOGIN
app.use("/api", authRoutes);

// ROUTE USER
app.use("/api/user", accessValidation, userRoutes);

// ROUTE BLOG
app.use("/api/blog", accessValidation, blogRoutes);

// ROUTE CATEGORY
app.use("/api/category", accessValidation, categoryRoutes);

// ROUTE TAG
app.use("/api/tag", accessValidation, tagRoutes);

// CREATE ADMINISTRATOR USER
// COMMAND IF ADMINISTRATOR USER SUCCESSFULLY CREATED
app.use("/api/administrator", administratorRoutes);
