// prisma.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  errorFormat: "pretty",
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully!");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

testConnection();

export default prisma;
