"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// PRISMA CLIENT
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    errorFormat: "pretty",
});
exports.default = prisma;
