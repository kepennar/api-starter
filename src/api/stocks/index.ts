import Router from "koa-router";
import fetch from "node-fetch";
import passport from "passport";

import { ApiError } from "../../errors";

export const exampleRouter = new Router();

exampleRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      ctx.body = await response.json();
    } catch (err) {
      ctx.throw(
        new ApiError(err, {
          message: `Error fetching todos`,
          statusCode: 400,
        })
      );
    }
  }
);
