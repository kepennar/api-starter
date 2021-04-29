import winston from "winston";
import { config } from "../config";

const appConfig = config.get("app");
const logConfig = config.get("log");

export const logger = winston.createLogger({
  level: logConfig.level,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    appConfig.env === "DEV" ? winston.format.cli() : winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

export const loggerStream = {
  write: function (message: string) {
    logger.info(message);
  },
};
