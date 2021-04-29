import { Auth } from "@agado/model";
import Router from "koa-router";
import { authenticationMiddleware } from "../../auth/auth.middleware";
import { setAuthorizationToken } from "../../auth/auth.utilities";
import { ApiState } from "../../auth/model/auth.model";
import { tokenService } from "../../auth/token.service";
import { UnAuthenticatedError } from "../../errors/Errors";
import { authService } from "../../services/auth.service";

export const authRouter = new Router<ApiState>();

authRouter.post("/login", async (ctx) => {
  const credentials = Auth.validateAuthBody(ctx.request.body);

  const loginResult = await authService.login(credentials);

  setAuthorizationToken(ctx, loginResult.token);
  const { password, ...userWithoutPassword } = loginResult.user;
  ctx.body = userWithoutPassword;
});

authRouter.post(
  "/logout",
  authenticationMiddleware({ ignoreExpiration: true }),
  async (ctx) => {
    const user = ctx.state.user;
    if (!user) {
      throw new UnAuthenticatedError();
    }
    await authService.logout(user);
    ctx.status = 204;
  }
);

authRouter.get("/refresh", authenticationMiddleware(), async (ctx) => {
  const jwtId = ctx.state.jti;

  if (!jwtId) {
    throw new UnAuthenticatedError();
  }
  const token = await tokenService.refreshAuthToken(jwtId);

  setAuthorizationToken(ctx, token);
  ctx.status = 201;
});
