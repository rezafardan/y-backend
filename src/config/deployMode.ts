// KONFIGURASI MODE DEPLOY
// ------------------------------------------------------------------
// Server ini bisa jalan di 2 mode:
//   - "production" : di belakang Caddy + HTTPS, pakai domain asli
//                    (docker-compose.yml, di server production).
//   - "local"      : testing di laptop lewat docker-compose lokal,
//                    tanpa HTTPS (docker-compose.yml + docker-compose.override.yml).
//
// Kenapa perlu dibedakan: cookie login (accessToken) cuma boleh dikirim
// browser dengan atribut Secure+SameSite=None kalau memang diakses lewat
// HTTPS. Kalau atribut itu dipaksa aktif padahal testing masih lewat HTTP
// biasa (localhost), browser akan DIAM-DIAM menolak simpan cookie-nya —
// akibatnya login kelihatan sukses (API balas 200) tapi sesi tidak
// tersimpan. DEPLOY_MODE dipakai untuk menyalakan pengaturan itu hanya saat
// benar-benar production.
//
// Cara ganti mode: set env DEPLOY_MODE=production atau DEPLOY_MODE=local.
// Kalau tidak diisi sama sekali, default aman: "local".
export const DEPLOY_MODE: "production" | "local" =
  process.env.DEPLOY_MODE === "production" ? "production" : "local";

export const isProductionMode = DEPLOY_MODE === "production";

// Origin frontend tambahan yang HANYA diizinkan lewat CORS saat mode local —
// ini port default dashboard (3001) & blog (3002) di docker-compose.override.yml.
// Tidak pernah aktif di production supaya tidak membuka CORS untuk sembarang
// origin di server publik.
export const LOCAL_DEV_ORIGINS = ["http://localhost:3001", "http://localhost:3002"];
