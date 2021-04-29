import Koa from "koa";
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import helmet from "koa-helmet";
import accesslog from "koa-morgan";
import qs from "koa-qs";
import { apiRouter } from "./api";
import { authenticationMiddleware } from "./auth/auth.middleware";
import { config } from "./config";
import { errorMiddleware } from "./errors/error.middleware";
import { fileStorageClient } from "./file-storage/client";
import { loggerStream } from "./logger";
import { appCorsMiddleware } from "./security/cors";

const appConfig = config.get("app");
const logConfig = config.get("log");

export async function createApp() {
  const app = new Koa();

  await fileStorageClient.init();

  qs(app);
  app.use(errorMiddleware);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(appCorsMiddleware(appConfig.env));
  app.use(accesslog(logConfig.format, { stream: loggerStream }));
  app.use(compress());
  app.use(bodyParser());
  app.use(apiRouter.routes());

  app.use(authenticationMiddleware());

  return app;
}
