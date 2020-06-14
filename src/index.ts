import { createApp } from "./app";
import { config } from "./config";

const serverConfig = config.get("server");
const debugConfig = config.get("debug");

if (debugConfig.sourcemap) {
  require("source-map-support").install();
}

const app = createApp();
app.listen(serverConfig.port);
console.log("listening on port", serverConfig.port);
