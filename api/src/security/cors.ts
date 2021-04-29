import cors from "@koa/cors";
import { Context } from "koa";
import { ENV } from "../config";

const VALID_PROD_DOMAINS = [
  "https://justplayfair.com",
  "https://justplayfair-prod.web.app",
];

export function appCorsMiddleware(env: ENV) {
  return cors({
    origin: isValidOrigin(env),
    exposeHeaders: ["Authorization", "Content-Disposition"],
    credentials: true,
    keepHeadersOnError: true,
    maxAge: 86400,
  });
}

function isValidOrigin(env: ENV) {
  return function (ctx: Context) {
    const origin = ctx.headers.origin;
    if (origin && isAValidDomain(env, origin)) {
      return origin;
    }
    return "";
  };
}

function isAValidDomain(env: ENV, domain: string): boolean {
  switch (env) {
    case "PROD":
      return VALID_PROD_DOMAINS.includes(domain);
    case "INTEG":
      return /^https:\/\/justplayfair-front.*(\.firebaseapp\.com|web\.app)$/.test(
        domain
      );
    default:
      return domain === "http://localhost:3000";
  }
}
