import { Errors } from "@agado/model";
import Router from "koa-router";
import { authenticationMiddleware } from "../../auth/auth.middleware";
import { ApiState } from "../../auth/model/auth.model";
import { ApiError, UnAuthenticatedError } from "../../errors/Errors";
import { fileStorageClient } from "../../file-storage/client";
import { userService } from "../../services/user.service";

export const mediaRouter = new Router<ApiState>();

mediaRouter.get("/", authenticationMiddleware(), async (ctx) => {
  const fileSrc = ctx.request.query.src;

  if (!fileSrc) {
    throw new ApiError(
      Errors.ApiErrorCode.DATA_WRONG_REQUEST,
      "Missing 'fileSrc' query param",
      {
        statusCode: 403,
      }
    );
  }
  if (Array.isArray(fileSrc)) {
    throw new ApiError(
      Errors.ApiErrorCode.DATA_WRONG_REQUEST,
      "Array received. Must query one file at the time",
      {
        statusCode: 403,
      }
    );
  }

  if (!ctx.state.user) {
    throw new UnAuthenticatedError();
  }
  const permissionTickets = await userService.getUserPermissionTickets(
    ctx.state.user.id
  );

  const obj = await fileStorageClient.getObject(fileSrc, permissionTickets);
  ctx.body = obj;
  ctx.set("Cache-Control", "max-age=2592000"); // 30 days in seconds
});

mediaRouter.post("/");
