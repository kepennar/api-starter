import appRootPath from "app-root-path";
import Router from "koa-router";
import path from "path";
import { logger } from "../../logger";
import { ICheckerFn } from "./model/checkers.model";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require(`${appRootPath}${path.sep}/api/package.json`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
export function health(checks: ICheckerFn[] = []): Router.IMiddleware<any, {}> {
  return async (ctx) => {
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
  };
}
