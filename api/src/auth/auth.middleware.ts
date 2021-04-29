import { Errors } from "@agado/model";
import { Middleware } from "koa";
import { ApiError, UnAuthenticatedError } from "../errors/Errors";
import { decodeJwt, jwtFromRequest } from "./auth.utilities";
import {
  ApiState,
  AuthenticationMiddlewareOpts,
  WithRouterApiContext,
} from "./model/auth.model";
import { tokenService } from "./token.service";

export function authenticationMiddleware(
  { ignoreExpiration }: AuthenticationMiddlewareOpts = {
    ignoreExpiration: false,
  }
): Middleware<ApiState, WithRouterApiContext> {
  return async (context, next) => {
    const jwtToken = jwtFromRequest(context);
    if (!jwtToken) {
      throw new UnAuthenticatedError();
    }

    const userClaims = decodeJwt(jwtToken, { ignoreExpiration });

    const user = await tokenService.findUserByValidAuthToken(userClaims.jti);
    if (user && !user.deleted && user.activated) {
      context.state.user = user;
      context.state.jti = userClaims.jti;
    } else {
      throw new ApiError(
        Errors.ApiErrorCode.AUTHENT_UNAUTHENTICATED,
        "No account",
        {
          statusCode: 401,
        }
      );
    }

    await next();
  };
}
