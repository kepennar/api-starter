import { Errors } from "@agado/model";
import { Context, HttpError, Next } from "koa";
import { ValidationError } from "yup";
import { config } from "../config";
import { logger } from "../logger";
import { ApiError } from "./Errors";

const appConfig = config.get("app");

export async function errorMiddleware(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    logger.error(error);
    if (error instanceof HttpError) {
      const apiErrorCode = Errors.ApiErrorCode.API_ERROR;
      ctx.status = error.statusCode;
      ctx.body = {
        apiErrorCode,
        message: error.details,
      };
      return ctx;
    }

    if (error instanceof ApiError) {
      ctx.status = error.statusCode;
      ctx.body = {
        apiErrorCode: error.apiErrorCode,
        message: error.details,
      };
      return ctx;
    }

    if (error instanceof ValidationError) {
      const apiErrorCode = Errors.ApiErrorCode.DATA_WRONG_REQUEST;

      ctx.status = 400;
      ctx.body = { apiErrorCode, value: error.value, message: error.errors };
      return ctx;
    }

    const apiErrorCode = Errors.ApiErrorCode.API_ERROR;

    ctx.status = 500;
    ctx.body = {
      apiErrorCode,
      message: appConfig.env === "PROD" ? "Technical error" : error.message,
    };
  }
}
