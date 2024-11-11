import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logRequest from "./middleware/logs.middleware";
import accessValidation from "./middleware/accessValidation.midlleware";
import authRoutes from "./routes/auth.routes";
import blogRoutes from "./routes/blog.routes";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";

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

// ROUTE LOGIN
app.use("/api/login", authRoutes);

// ROUTE USER
app.use("/api/user", accessValidation, userRoutes);

// ROUTE BLOG
app.use("/api/blog", accessValidation, blogRoutes);

// ROUTE CATEGORY
app.use("/api/category", accessValidation, categoryRoutes);

app.listen(PORT, () => {
  console.log(`Server running in PORT: ${PORT}`);
});
