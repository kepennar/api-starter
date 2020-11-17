import Router from "koa-router";
import fetch from "node-fetch";
import passport from "passport";
import { authenticationMiddleware } from "../../auth/auth.strategies";

import { ApiError } from "../../errors";

export const exampleRouter = new Router();

exampleRouter.get("/", authenticationMiddleware, async (ctx) => {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos`, {
      headers: { "Content-Type": "application/json" },
    });
    const todos = await response.json();
    ctx.body = todos;
  } catch (err) {
    ctx.throw(
      new ApiError(err, {
        message: `Error fetching todos`,
        statusCode: 400,
      })
    );
  }
});
