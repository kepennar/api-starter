import { IMiddleware } from "koa-router";
import path from "path";
import appRootPath from "app-root-path";
const { name, version } = require(appRootPath + path.sep + "package.json");

type Check = () => Promise<unknown>;

const defaultChecker = async () => ({ name: "status", value: "OK" });

export function health(checks: Check[] = []): IMiddleware {
  return async (ctx, next) => {
    const checkers = await Promise.all(
      [defaultChecker, ...checks].map((fn) => fn())
    );
    ctx.body = {
      name,
      version,
      checkers,
    };
    next();
  };
}
