import { Errors, User } from "@agado/model";
import Router from "koa-router";
import { authenticationMiddleware } from "../../auth/auth.middleware";
import { ApiState } from "../../auth/model/auth.model";
import { ApiError } from "../../errors/Errors";
import { userService } from "../../services/user.service";

export const userRouter = new Router<ApiState>();

userRouter.get("/tokenUser/:token", async (ctx) => {
  const token = ctx.params.token;

  if (!token) {
    throw new ApiError(
      Errors.ApiErrorCode.DATA_WRONG_REQUEST,
      "Missing token",
      {
        statusCode: 400,
      }
    );
  }
  ctx.status = 200;
  ctx.body = await userService.getTokenUser(token);
});

userRouter.post("/activate", async (ctx) => {
  const activation = User.validateActivateBody(ctx.request.body);

  await userService.activateAccount(activation);
  ctx.status = 201;
  ctx.body = { message: "activated" };
});

userRouter.post("/askRenew", async (ctx) => {
  const { email } = User.validateAskRenewPasswordBody(ctx.request.body);
  await userService.sendRenewPassword(email);
  ctx.status = 201;
});

userRouter.post("/changePassword", async (ctx) => {
  const changePasswordFields = User.validateChangePasswordBody(
    ctx.request.body
  );
  await userService.changePassword(changePasswordFields);
  ctx.status = 201;
});

userRouter.get("/me", authenticationMiddleware(), async (ctx) => {
  ctx.body = ctx.state.user;
});

userRouter.post("/close/:uuid", authenticationMiddleware(), async (ctx) => {
  const authenticatedUser = ctx.state.user;
  const userIdToBeDeleted = ctx.params.uuid;
  await userService.closeAccount(authenticatedUser, userIdToBeDeleted);
});
