import { PrismaClient } from "@prisma/client";
import { config } from "../config";

const dbConfig = config.get("db");
const appConfig = config.get("app");

export const prisma = new PrismaClient({
  log: appConfig.env === "DEV" ? ["query", "info", "warn"] : ["info", "warn"],
  datasources: {
    db: {
      url: dbConfig.url,
    },
  },
});
