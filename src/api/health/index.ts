import Koa from "koa";
import path from "path";
import appRootPath from "app-root-path";

const packageJson = require(`${appRootPath}${path.sep}package.json`);

export interface ICheckerReturn {
  name: string;
  status: boolean;
}

export type ICheckerFn = () => Promise<ICheckerReturn>;

export function health(checks: ICheckerFn[] = []) {
  return async (ctx: Koa.Context, next: ICheckerFn) => {
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
