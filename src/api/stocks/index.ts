import Router from "koa-router";
import fetch from "node-fetch";

import { ApiError } from "../../errors";

export const stockRouter = new Router();

const DEFAULT_SYMBOL = "GOOG";

stockRouter.get("/", async (ctx) => {
  const symbol = ctx.query.symbol || DEFAULT_SYMBOL;
  try {
    const response = await fetch(
      `https://api.iextrading.com/1.0/stock/${symbol}/quote`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    ctx.body = await response.json();
  } catch (err) {
    ctx.throw(
      new ApiError(err, {
        message: `Error fetching quote ${symbol}`,
        statusCode: 400,
      })
    );
  }
});
