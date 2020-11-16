import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./logger";

const serverConfig = config.get("server");
const debugConfig = config.get("debug");

if (debugConfig.sourcemap) {
  require("source-map-support").install();
}

const app = createApp();
app.listen(serverConfig.port);
logger.info(`listening on port ${serverConfig.port}`);
