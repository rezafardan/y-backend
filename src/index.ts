import express from "express";

import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

// SERVICE
import initializeFolders from "./services/folder/initializeFolders";

// MIDDLEWARE
import logRequest from "./middlewares/logs.middleware";
import logError from "./middlewares/logsError.middleware";
import accessValidation from "./middlewares/accessValidation.midlleware";

// ROUTES
import rootRoutes from "./routes/_root.routes";
import authRoutes from "./routes/auth.routes";
import blogRoutes from "./routes/blog.routes";
import categoryRoutes from "./routes/category.routes";
import tagRoutes from "./routes/tag.routes";
import userRoutes from "./routes/user.routes";
import administratorRoutes from "./routes/administrator.routes";

// ENV
import dotenv from "dotenv";

// MODE DEPLOY (production / local) — lihat src/config/deployMode.ts
import { DEPLOY_MODE, LOCAL_DEV_ORIGINS } from "./config/deployMode";

const app = express();
dotenv.config();

// ONLY DISABLE ON VERCEL PRODUCTION
// CREATE NEW FOLDERS FOR ASSETS
initializeFolders();


// ALLOWED ORIGINS
// FRONTEND_URL berisi domain asli dashboard & blog (dipisah koma).
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// MODE LOCAL: tambahkan origin default docker-compose lokal (dashboard di
// :3001, blog di :3002) supaya CORS tidak memblokir testing di laptop.
// Tidak pernah aktif di mode production.
if (DEPLOY_MODE === "local") {
  allowedOrigins.push(...LOCAL_DEV_ORIGINS);
}

// MIDDLEWARE CROSS ORIGIN
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// SET PROXY CORS
app.set("trust proxy", true);

// MIDDLEWARE LOG
app.use(logRequest);

// ROOT ROUTE WITHOUT VALIDATION
app.get("/", rootRoutes);

// MIDDLEWARE PARSING JSON
app.use(express.json());

// MIDDLEWARE HTTP COOKIES PARSER
app.use(cookieParser());

// MIDDLEWARE ACCESS ASSET FILES
app.use("/public/assets/blog", express.static(path.resolve("public/assets/blog")));

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
// TIDAK pakai accessValidation blanket di sini (beda dari /api/user, /api/tag,
// /api/category) — GET blog harus bisa diakses situs blog publik (y-blogpage)
// yang tidak pernah login. Setiap route TULIS di blog.routes.ts sudah pasang
// accessValidation + authorizeRole sendiri; GET dibiarkan publik di sana.
app.use("/api/blog", blogRoutes);

// =============================== //
// CREATE ADMINISTRATOR USER
// KEAMANAN: route ini dulu tidak pakai accessValidation sama sekali, artinya
// SIAPA PUN bisa bikin akun ADMINISTRATOR baru tanpa login. Sekarang sudah
// ada seed admin default (lihat src/scripts/seedAdmin.ts) untuk bootstrap
// awal, jadi route ini wajib dikunci: harus login (accessValidation) DAN
// role-nya ADMINISTRATOR (dicek lagi di administrator.routes.ts).
app.use("/api/administrator", accessValidation, administratorRoutes);
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
app.use(logError);

// export default app;
