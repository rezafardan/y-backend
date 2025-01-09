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

// ENV
import dotenv from "dotenv";

const app = express();
dotenv.config();

// MIDDLEWARE CROSS ORIGIN
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.set("trust proxy", true);

// MIDDLEWARE LOG
app.use(logRequest);

// ROOT ROUTE WITHOUT VALIDATION
app.get("/", (req, res) => {
  res.send("Express works!");
});

// MIDDLEWARE PARSING JSON
app.use(express.json());

// MIDDLEWARE HTTP COOKIES PARSER
app.use(cookieParser());

// MIDDLEWARE ACCESS ASSET FILES
app.use("/public", accessValidation, express.static(path.resolve("public")));

// ROUTE LOGIN
app.use("/api", authRoutes);

// ROUTE USER
app.use("/api/user", accessValidation, userRoutes);

// ROUTE TAG
app.use("/api/tag", accessValidation, tagRoutes);

// ROUTE CATEGORY
app.use("/api/category", accessValidation, categoryRoutes);

// ROUTE BLOG
app.use("/api/blog", accessValidation, blogRoutes);

// CREATE ADMINISTRATOR USER
// COMMAND IF ADMINISTRATOR USER SUCCESSFULLY CREATED
app.use("/api/administrator", administratorRoutes);

app.listen("3001");

// export default app;
