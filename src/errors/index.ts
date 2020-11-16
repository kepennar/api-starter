import { Context, HttpError, Next } from "koa";
import { ValidationError } from "yup";
import { logger } from "../logger";
import { config } from "../config";

const appConfig = config.get("app");

interface ApiErrorOpts {
  statusCode?: number;
  message?: string;
}

export class ApiError extends Error {
  statusCode: number;
  details: unknown;

  constructor(initialError: Error, options: ApiErrorOpts = {}) {
    super(initialError.message);
    const { statusCode = 500, message } = options;

    this.message = message || "An error occured";
    this.details = initialError.message;
    this.statusCode = statusCode;
  }
}

export async function errorMiddleware(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      ctx.status = error.statusCode;
      ctx.body = {
        message: error.details,
      };
      return ctx;
    }
    if (error instanceof HttpError) {
      ctx.status = error.statusCode;
      ctx.body = {
        message: error.details,
      };
      return ctx;
    }
    if (error instanceof ValidationError) {
      ctx.body = 403;
      ctx.body = { value: error.value, message: error.errors };
      return ctx;
    }

    ctx.status = 500;
    ctx.body = {
      message: appConfig.env === "PROD" ? "Technical error" : error.message,
    };
  }
}
