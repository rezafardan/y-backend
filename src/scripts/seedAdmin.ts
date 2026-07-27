// Membuat 1 user ADMINISTRATOR default kalau belum ada administrator sama
// sekali di database. Dipanggil sekali setiap container start (lihat CMD di
// backend.Dockerfile) — aman dijalankan berulang karena hanya insert saat
// benar-benar belum ada administrator.
import bcrypt from "bcrypt";
import prisma from "../models/prisma";

async function seedAdmin() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMINISTRATOR" },
  });

  if (existingAdmin) {
    console.log("Seed: administrator sudah ada, lewati seeding.");
    return;
  }

  const username = process.env.SEED_ADMIN_USERNAME || "demo";
  const password = process.env.SEED_ADMIN_PASSWORD || "demo";
  const email = process.env.SEED_ADMIN_EMAIL || "demo@example.com";

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await prisma.user.create({
    data: {
      username,
      fullname: "Demo Administrator",
      email,
      passwordHash,
      role: "ADMINISTRATOR",
    },
  });

  // PERINGATAN KEAMANAN: kredensial default ini untuk testing awal saja.
  // Ganti password akun ini segera setelah login pertama, dan jangan pernah
  // pakai default demo/demo di server yang benar-benar production/publik.
  console.log(
    `Seed: administrator default "${username}" berhasil dibuat. Segera ganti passwordnya setelah login pertama.`
  );
}

seedAdmin()
  .catch((error) => {
    console.error("Seed: gagal membuat administrator default:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
