import winston from "winston";

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

export const loggerStream = {
  write: function (message: string) {
    logger.info(message);
  },
};
