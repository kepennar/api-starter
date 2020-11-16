import Router from "koa-router";

import { health } from "./health";
import { exampleRouter } from "./todos";
import { authRouter } from "./auth";
import { dbChecker } from "./health/db.checker";

export const apiRouter = new Router();

apiRouter.get("/", (ctx) => (ctx.body = "Welcome to Node-API-Starter"));
apiRouter.use("/auth", authRouter.routes(), authRouter.allowedMethods());
apiRouter.use("/todos", exampleRouter.routes(), exampleRouter.allowedMethods());

// Possibility to customize checks
//  app.use(health([async () => { Check connectivity} ]));
apiRouter.get("/health", health([dbChecker]));

apiRouter.get(
  "/routes",
  (ctx) =>
    (ctx.body = apiRouter.stack
      .filter((r) => r.methods && r.methods.length > 0)
      .map((r) => ({
        path: r.path,
        method: r.methods,
      })))
);
