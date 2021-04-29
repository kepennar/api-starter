import { User } from "@agado/model";
import { EmailTokenType } from "@prisma/client";
import type { ParameterizedContext } from "koa";
import type Router from "koa-router";

export interface AuthenticationMiddlewareOpts {
  ignoreExpiration?: boolean;
}

export interface ApiState {
  user?: User.User;
  jti?: string;
}

export type WithRouterApiContext = ParameterizedContext<
  ApiState,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Router.IRouterParamContext<ApiState, {}>
>;

export interface EmailTokenMetadata {
  tokenValue: string;
  expiration: Date;
  type: EmailTokenType;
}
