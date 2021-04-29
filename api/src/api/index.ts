import Router from "koa-router";

import { health } from "./health";
import { authRouter } from "./auth/auth.restApi";
import { userRouter } from "./user/user.restApi";
import { mediaRouter } from "./media/media.restApi";

export const apiRouter = new Router();

apiRouter.get("/", (ctx) => (ctx.body = "Welcome to Node-API-Starter"));
apiRouter.use("/auth", authRouter.routes(), authRouter.allowedMethods());
apiRouter.use("/user", userRouter.routes(), userRouter.allowedMethods());
apiRouter.use("/file", mediaRouter.routes(), mediaRouter.allowedMethods());

// Possibility to customize checks
//  app.use(health([async () => { Check connectivity} ]));
apiRouter.get("/health", health());

// List all available routes
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
