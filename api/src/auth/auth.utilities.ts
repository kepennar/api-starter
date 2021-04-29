import { Auth } from "@agado/model";
import argon2 from "argon2";
import jwt, { VerifyOptions } from "jsonwebtoken";
import { config } from "../config";
import { UnAuthenticatedError } from "../errors/Errors";
import { WithRouterApiContext } from "./model/auth.model";

const authConfig = config.get("auth");
export const AUTH_COOKIE_NAME = "token";

export function jwtFromRequest(
  context: WithRouterApiContext
): string | undefined {
  if (authConfig.mode === "cookies") {
    return context.cookies.get(AUTH_COOKIE_NAME);
  }
  if (authConfig.mode === "header") {
    return context.request.get("Authorization")?.replace("Bearer ", "");
  }
}

export function decodeJwt(
  jwtToken: string,
  verifyOptions?: VerifyOptions
): Auth.AuthTokenClaims {
  try {
    return verifyJwt(jwtToken, verifyOptions);
  } catch (error) {
    throw new UnAuthenticatedError("Wrong token in request");
  }
}

export async function hashPassword(
  nonEncodedPassword: string
): Promise<string> {
  return argon2.hash(nonEncodedPassword);
}

export async function comparePassword(
  hashedPassword: string,
  password: string
): Promise<boolean> {
  return argon2.verify(hashedPassword, password);
}

export async function generateRandomPassword(): Promise<string> {
  return await hashPassword(Math.random().toString(36).slice(-8));
}

export function verifyJwt(
  jwtToken: string,
  verifyOptions?: VerifyOptions
): Auth.AuthTokenClaims {
  return jwt.verify(
    jwtToken,
    authConfig.jwtSecret,
    verifyOptions
  ) as Auth.AuthTokenClaims;
}

function setAuthCookie(ctx: WithRouterApiContext, token: string) {
  ctx.cookies.set(AUTH_COOKIE_NAME, token, {
    maxAge: authConfig.jwtExpires * 1000,
  });
}

function setAuthHeader(ctx: WithRouterApiContext, token: string) {
  ctx.set("Authorization", `Bearer ${token}`);
}

export function setAuthorizationToken(
  ctx: WithRouterApiContext,
  token: string
) {
  const authMode = authConfig.mode;
  if (authMode === "cookies") {
    setAuthCookie(ctx, token);
  }
  if (authMode === "header") {
    setAuthHeader(ctx, token);
  }
}
