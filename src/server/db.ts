// Prisma client singleton — dev-də hot-reload zamanı təkrar bağlantının qarşısını alır.
// Bütün server kodu DB-yə yalnız bu client vasitəsilə çıxır.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
