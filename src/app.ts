import Koa from "koa";
import bodyParser from "koa-bodyparser";
import compress from "koa-compress";
import helmet from "koa-helmet";
import accesslog from "koa-morgan";
import passport from "koa-passport";
import { apiRouter } from "./api";
import "./auth/auth.strategies";
import { config } from "./config";
import { errorMiddleware } from "./errors";
import { loggerStream } from "./logger";

const logConfig = config.get("log");

export function createApp() {
  const app = new Koa();

  app.use(errorMiddleware);
  app.use(helmet());
  app.use(accesslog(logConfig.format, { stream: loggerStream }));
  app.use(compress());
  app.use(bodyParser());
  app.use(passport.initialize());
  app.use(apiRouter.routes());

  return app;
}
