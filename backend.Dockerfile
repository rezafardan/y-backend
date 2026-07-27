# KEAMANAN CI/CD:
# - Jangan pernah tambahkan ARG/ENV berisi secret asli (DB password, JWT
#   secret, dll) di Dockerfile ini — nilainya akan tersimpan permanen di layer
#   image dan bisa dibaca ulang lewat `docker history`. Semua secret backend
#   disuntikkan saat runtime lewat environment: di docker-compose.yml, bukan
#   di sini.
# - `.dockerignore` di folder ini WAJIB tetap mengecualikan node_modules, .env,
#   .git, dan dist lama — kalau tidak, isi host bisa ikut ter-COPY ke image
#   dan menimpa hasil build yang bersih (pernah kejadian: node_modules Windows
#   dari host menimpa node_modules Linux hasil pnpm install di container).
FROM node:22-slim AS build
WORKDIR /app
ENV CI=true
RUN corepack enable && apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/models ./src/models
RUN pnpm config set network-concurrency 2 && \
    pnpm config set fetch-retries 10 && \
    pnpm config set fetch-retry-maxtimeout 180000 && \
    pnpm install --frozen-lockfile --config.strict-dep-builds=false || pnpm install --frozen-lockfile
COPY . .
RUN npx tsc && cp -r src/views dist/views

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV CI=true
RUN corepack enable && apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/models ./src/models
RUN pnpm config set network-concurrency 2 && \
    pnpm config set fetch-retries 10 && \
    pnpm config set fetch-retry-maxtimeout 180000 && \
    pnpm install --frozen-lockfile --prod --config.strict-dep-builds=false || pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
RUN mkdir -p public/assets
EXPOSE 4000
# CATATAN CI/CD: `prisma db push` jalan setiap kali container start, dan tidak
# mencatat riwayat migrasi (beda dengan `prisma migrate deploy`). Aman untuk
# 1 instance seperti sekarang, tapi kalau nanti backend di-scale ke beberapa
# replica sekaligus, beberapa container bisa balapan ubah schema di waktu yang
# sama. Untuk production yang lebih matang, pindahkan langkah migrasi ke satu
# job terpisah di pipeline CI/CD (jalan sekali sebelum container baru start),
# lalu ganti CMD di sini jadi cuma `node dist/index.js`.
# CATATAN: seedAdmin.js membuat 1 user ADMINISTRATOR default (demo/demo, atau
# SEED_ADMIN_USERNAME/SEED_ADMIN_PASSWORD/SEED_ADMIN_EMAIL kalau di-set) HANYA
# kalau belum ada administrator sama sekali — aman dijalankan tiap start.
CMD sh -c "npx prisma db push --schema src/models/schema.prisma --skip-generate && node dist/scripts/seedAdmin.js && node dist/index.js"