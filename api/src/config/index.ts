import { Role } from ".prisma/client";
import { Auth } from "@agado/model";
import convict from "convict";
import convict_format_with_validator from "convict-format-with-validator";
import dotenv from "dotenv";
import path from "path";

convict.addFormats(convict_format_with_validator);

const dotenvPath = process.env.CONFIG_PATH
  ? path.resolve(process.cwd(), process.env.CONFIG_PATH)
  : undefined;

if (dotenvPath) {
  console.log(`Loading env variables from "${dotenvPath}"`);
}
dotenv.config({ path: dotenvPath });

export type ENV = "TEST" | "DEV" | "INTEG" | "PROD";
export type TracingExporter = "none" | "console" | "zipkin";

export const config = convict({
  app: {
    env: {
      doc: "application environment",
      format: ["TEST", "DEV", "INTEG", "PROD"],
      default: "PROD" as ENV,
      env: "APP_ENV",
    },
    activationPage: {
      doc: "Account activation page url",
      format: "url",
      default: "",
      env: "APP_ACTIVATION_URL",
    },
    changePasswordPage: {
      doc: "Account change password page url",
      format: "url",
      default: "",
      env: "APP_CHANGE_PASSWORD_URL",
    },
    superAdminEmail: {
      doc: "Email of super-admin user",
      format: "email",
      default: "",
      env: "APP_SUPER_ADMIN_EMAIL",
    },
    dataEncryptionKey: {
      doc: "Key used to encrypt sensitive user data. Must be 32 char",
      format: "*",
      default: "",
      env: "APP_DATA_ENCRYPTION_KEY",
    },
    accountCreationWorkflowActivatedFor: {
      doc:
        "User roles for which the account creation workflow must be triggered by sending an email",
      format: Array,
      default: [] as Role[],

      env: "APP_ACCOUNT_CREATION_WORKFLOW_ACTIVATED_FOR",
    },
  },
  server: {
    port: {
      doc: "server port",
      format: "port",
      default: 3000,
      env: "PORT",
    },
    timeout: {
      doc: "Request timeout (in ms)",
      format: "int",
      default: 3000,
      env: "SERVER_TIMEOUT",
    },
  },
  db: {
    url: {
      doc: "Database connection url",
      format: String,
      default: "to be defined",
      env: "DB_URL",
    },
  },
  auth: {
    mode: {
      doc: "Authentication mode",
      format: ["cookies", "header"],
      default: "cookies" as Auth.AuthMode,
      env: "AUTH_MODE",
    },
    jwtSecret: {
      doc: "Secret used to generate JWT",
      format: String,
      default: "to be defined",
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
      default: 7200,
      env: "AUTH_JWT_DURATION",
    },
  },
  fileStorage: {
    url: {
      doc: "File storage api url",
      format: "url",
      default: "",
      env: "FILE_STORAGE_URL",
    },
    port: {
      doc: "File storage api port",
      format: "port",
      default: 443,
      env: "FILE_STORAGE_PORT",
    },
    accessKey: {
      doc: "File storage api access key",
      format: "*",
      default: "",
      env: "FILE_STORAGE_ACCESS_KEY",
    },
    secretKey: {
      doc: "File storage api secret key",
      format: "*",
      default: "",
      env: "FILE_STORAGE_SECRET_KEY",
    },
  },
  mail: {
    host: {
      doc: "SMTP host",
      format: "url",
      default: "",
      env: "MAIL_HOST",
    },
    port: {
      doc: "SMTP port",
      format: "port",
      default: 1025,
      env: "MAIL_PORT",
    },
    user: {
      doc: "SMTP username",
      format: "*",
      default: "",
      env: "MAIL_USERNAME",
    },
    password: {
      doc: "SMTP password",
      format: "*",
      default: "",
      env: "MAIL_PASSWORD",
    },
    from: {
      doc: "Email from field",
      format: "email",
      default: "",
      env: "MAIL_FROM",
    },
    mailTokenExpiration: {
      doc: "Email token duration in minutes",
      format: Number,
      default: 10,
      env: "EMAIL_TOKEN_EXPIRATION_MINUTES",
    },
  },
  log: {
    level: {
      doc: "Log level",
      format: ["error", "warning", "notice", "info", "debug"],
      default: "warning",
      env: "LOG_LEVEL",
    },
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
  tracing: {
    exporter: {
      doc: "Open tracing exporter",
      format: ["none", "console", "zipkin"],
      default: "none" as TracingExporter,
      env: "TRACING_EXPORTER",
    },
  },
});

config.validate({ allowed: "strict" });
