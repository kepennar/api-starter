import "./telemetry/tracing.config";

import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./logger";

const serverConfig = config.get("server");
const debugConfig = config.get("debug");

if (debugConfig.sourcemap) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("source-map-support").install();
}
(async () => {
  try {
    const app = await createApp();
    const server = app.listen(serverConfig.port);
    server.timeout = serverConfig.timeout;

    logger.info(`listening on port ${serverConfig.port}`);

    process.on("SIGTERM", () => process.kill(process.pid, "SIGINT"));
  } catch (error) {
    logger.error("Unable to start app :(", error);
    process.kill(process.pid, "SIGINT");
  }
})();
