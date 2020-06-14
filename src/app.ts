import Koa from "koa";
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import helmet from "koa-helmet";
import accesslog from "koa-morgan";
import { apiRouter } from "./api";
import { config } from "./config";

const logConfig = config.get("log");

export function createApp() {
  const app = new Koa();

  app.use(helmet());
  app.use(accesslog(logConfig.format));
  app.use(compress());
  app.use(bodyParser());

  app.use(apiRouter.routes());

  return app;
}
