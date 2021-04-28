import { Server } from "http";
import { createApp } from "../../src/app";

export async function createAppServer(): Promise<Server> {
  const app = createApp();
  return app.listen();
}
