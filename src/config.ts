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
