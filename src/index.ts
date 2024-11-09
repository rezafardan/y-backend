import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logRequest from "./middlewares/logs";
import authRoutes from "./routes/auth";
import blogRoutes from "./routes/blog";
import userRoutes from "./routes/user";
import categoryRoutes from "./routes/category";
import accessValidation from "./middlewares/accessValidation";

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
app.use("/login", authRoutes);

// ROUTE USER
app.use("/user", accessValidation, userRoutes);

// ROUTE BLOG
app.use("/blog", accessValidation, blogRoutes);

// ROUTE CATEGORY
app.use("/category", accessValidation, categoryRoutes);

app.listen(PORT, () => {
  console.log(`Server running in PORT: ${PORT}`);
});
