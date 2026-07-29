# Neuvarixal Backend

REST API (Express + TypeScript + Prisma/MySQL) yang jadi backend bersama untuk **y-dashboard** (CMS) dan **y-blogpage** (situs blog publik). Menangani autentikasi, manajemen user/blog/kategori/tag, dan upload media.

Repo ini adalah salah satu dari 4 repo dalam sistem Neuvarixal:

| Repo | Peran |
| --- | --- |
| **y-backend** (repo ini) | REST API |
| [y-dashboard](https://github.com/rezafardan/y-dashboard) | CMS untuk mengelola blog |
| [y-blogpage](https://github.com/rezafardan/y-blogpage) | Situs blog publik |
| [neuvarixal-deploy](https://github.com/rezafardan/neuvarixal-deploy) | docker-compose, Terraform (AWS), CI/CD, monitoring |

## Tech stack

- Express 4 + TypeScript
- Prisma ORM (MySQL — Aiven di production, MySQL lokal opsional untuk dev)
- JWT (cookie `httpOnly`) untuk autentikasi, bcrypt untuk hash password
- Multer untuk upload file (cover image blog, gambar konten, foto profil)
- Winston untuk logging

## Menjalankan secara lokal

Cara termudah adalah lewat `neuvarixal-deploy` (lihat README di repo itu — `docker compose up` sekaligus menjalankan MySQL lokal, backend, dashboard, dan blog). Untuk jalan berdiri sendiri:

```bash
pnpm install
cp .env.example .env   # isi DATABASE_URL dkk (lihat tabel di bawah)
npx prisma db push --schema src/models/schema.prisma
pnpm build && node dist/index.js
```

Server jalan di port **4000**.

## Environment variables

| Variabel | Wajib? | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Connection string MySQL (Prisma). Kalau pakai Aiven/managed DB yang minta SSL, tambahkan `?ssl-mode=REQUIRED` di akhir URL. |
| `ACCESS_TOKEN_SECRET` | ✅ | Secret buat sign JWT. Generate acak, mis. `openssl rand -hex 32`. |
| `FRONTEND_URL` | ✅ | Daftar origin yang diizinkan CORS, dipisah koma — isi URL dashboard **dan** blog, mis. `https://dash.example.com,https://blog.example.com`. |
| `DEPLOY_MODE` | opsional (default `local`) | `production` mengaktifkan cookie `Secure`+`SameSite=None` (butuh HTTPS) dan menolak origin `localhost` di CORS. `local` sebaliknya, supaya bisa dites di `http://localhost`. Lihat `src/config/deployMode.ts`. |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_EMAIL` | opsional | Kalau belum ada 1 pun user `ADMINISTRATOR` di database, dibuatkan otomatis saat start (default `demo`/`demo`/`demo@example.com`). Lihat `src/scripts/seedAdmin.ts` — **ganti password default ini di server publik**. |
| `NODE_ENV` | opsional | Standar Node/Express, set `production` di deployment. |

## Struktur proyek

```text
src/
  index.ts                 # entrypoint Express (CORS, middleware, mounting routes)
  config/deployMode.ts     # toggle perilaku cookie/CORS local vs production
  scripts/seedAdmin.ts     # seed 1 administrator default saat container start
  routes/                  # definisi endpoint per resource
  controllers/             # logic tiap endpoint
  middlewares/             # accessValidation (JWT), authorizeRole, upload, dll
  services/                # helper/validator dipakai controller
  models/schema.prisma     # skema database Prisma
  models/prisma.ts         # instance PrismaClient
  views/index.html         # halaman landing statis di "/"
```

## API — ringkasan endpoint

Base path semua route (kecuali `/`) adalah `/api`. Middleware `accessValidation` = wajib login (cookie `accessToken` valid); `authorizeRole([...])` = wajib login **dan** role user termasuk yang disebut.

| Method & Path | Auth | Keterangan |
| --- | --- | --- |
| `GET /` | publik | Halaman landing statis |
| `POST /api/login` | publik | Login, set cookie `accessToken` |
| `POST /api/logout` | login | Hapus cookie |
| `GET /api/auth/check` | publik* | Cek status login (dipakai frontend saat load) |
| `GET /api/blog`, `GET /api/blog/:id` | **publik** | Sengaja publik — dipakai situs blog yang tidak login |
| `POST /api/blog`, `PATCH /api/blog/:id`, `DELETE /api/blog/:id`, `POST /api/blog/contentimage`, `POST /api/blog/coverimage` | login + role | Tulis/hapus blog & upload gambar |
| `GET/POST/PATCH/DELETE /api/user/*` | login (+role untuk sebagian besar) | Manajemen user; `/me` bisa diakses user sendiri |
| `GET/POST/PATCH/DELETE /api/category/*` | login + role | Manajemen kategori |
| `GET/POST/PATCH/DELETE /api/tag/*` | login + role | Manajemen tag |
| `POST /api/administrator` | login + role `ADMINISTRATOR` | Bikin administrator baru manual (bootstrap awal pakai `seedAdmin.ts`, bukan endpoint ini) |
| `GET /public/assets/blog/*` | publik | Static file cover/konten blog |
| `GET /public/*` (selain di atas) | login | Static file lain (mis. foto profil) |

> Kenapa `/api/blog` GET publik tapi `/api/category`, `/api/tag`, `/api/user` tidak: `/api/blog` dipakai 2 konsumen (dashboard yang login, dan situs blog publik yang tidak). Kalau nanti butuh menampilkan kategori/tag di situs publik juga, endpoint itu perlu dibuka publik dengan cara yang sama (pisahkan GET dari route yang butuh tulis).

## Docker

`backend.Dockerfile` — multi-stage build: compile TypeScript (`npx tsc`) di stage `build`, lalu jalankan `prisma db push` + `node dist/index.js` di stage `runtime`. Lihat `neuvarixal-deploy` untuk cara menjalankannya lewat docker compose (lokal maupun production).

## Deploy

CI/CD (`.github/workflows/build.yml`): setiap push ke `main`, build image, push ke GHCR (`ghcr.io/rezafardan/y-backend`), lalu memicu deploy otomatis di repo `neuvarixal-deploy`. Detail penuh alur CI/CD, infrastruktur (Terraform/AWS), dan monitoring ada di README repo [neuvarixal-deploy](https://github.com/rezafardan/neuvarixal-deploy).

Repo ini juga bisa di-deploy langsung ke Vercel (`vercel.json` disediakan) sebagai alternatif di luar Docker/AWS — env var yang dibutuhkan sama seperti tabel di atas, diisi lewat dashboard project Vercel (terpisah dari `.env` yang dipakai Docker).
