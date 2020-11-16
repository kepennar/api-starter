import appRootPath from "app-root-path";
import { Context, Next, ParameterizedContext } from "koa";
import { IRouterParamContext, RouterContext } from "koa-router";
import path from "path";

const packageJson = require(`${appRootPath}${path.sep}package.json`);

export interface ICheckerReturn {
  name: string;
  status: boolean;
}

export type ICheckerFn = () => Promise<ICheckerReturn>;

export function health(checks: ICheckerFn[] = []) {
  return async (ctx: RouterContext<any, {}>, next: Next) => {
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
