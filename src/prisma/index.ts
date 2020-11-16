import { PrismaClient } from "@prisma/client";
import { config } from "../config";

const dbConfig = config.get("db");

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbConfig.url,
    },
  },
});
