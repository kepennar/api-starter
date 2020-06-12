import convict from "convict";
require("dotenv").config();

export const config = convict({
  server: {
    port: {
      doc: "server port",
      format: "port",
      default: 3000,
      env: "PORT",
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
});

config.validate({ allowed: "strict" });
