import convict from "convict";
require("dotenv").config();

export const config = convict({
  app: {
    env: {
      doc: "application environment",
      format: String,
      default: "PROD",
      env: "APP_ENV",
    },
  },
  server: {
    port: {
      doc: "server port",
      format: "port",
      default: 3000,
      env: "PORT",
    },
  },
  db: {
    url: {
      doc: "Database connection url",
      format: String,
      default: null,
      env: "DB_URL",
    },
  },
  auth: {
    jwtSecret: {
      doc: "Secret used to generate JWT",
      format: String,
      default: null,
      env: "AUTH_SECRET_KEY",
    },
    passwordSaltRounds: {
      doc: "Number hashing round. Highest mean better cost factor",
      format: Number,
      default: 10,
      env: "AUTH_PASSWORD_SALT_ROUNDS",
    },
    jwtExpires: {
      doc: "Jwt token duration in seconds",
      format: Number,
      default: 3600,
      env: "AUTH_JWT_DURATION",
    },
  },
  log: {
    format: {
      doc: "Log format",
      format: "*",
      default: "tiny",
      env: "LOG_FORMAT",
    },
  },
  debug: {
    sourcemap: {
      doc: "Enable source-map",
      format: "Boolean",
      default: false,
      env: "SOURCE_MAP",
    },
  },
});

config.validate({ allowed: "strict" });
