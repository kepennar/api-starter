import appRootPath from "app-root-path";
import { Context, Next, ParameterizedContext } from "koa";
import Router, { IRouterParamContext, RouterContext } from "koa-router";
import path from "path";
import { ICheckerFn } from "./model/checkers.model";

const packageJson = require(`${appRootPath}${path.sep}package.json`);

export function health(checks: ICheckerFn[] = []): Router.IMiddleware<any, {}> {
  return async (ctx, next: Next) => {
    const checkers = await Promise.all(checks.map((fn) => fn()));

    const globalStatus = checkers.reduce(
      (status, item) => status && item.status,
      true
    );
    if (!globalStatus) {
      ctx.status = 503;
    }
    ctx.body = {
      name: packageJson.name,
      version: packageJson.version,
      status: globalStatus,
      checkers,
    };
    next();
  };
}
