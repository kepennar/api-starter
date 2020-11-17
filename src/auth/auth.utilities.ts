import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Context, DefaultContext } from "koa";
import { config } from "../config";
import { AUTH_COOKIE_NAME } from "./auth.strategies";

const authConfig = config.get("auth");

export async function hashPassword(
  nonEncodedPassword: string
): Promise<string> {
  const salt = await bcrypt.genSalt(authConfig.passwordSaltRounds);
  return bcrypt.hash(nonEncodedPassword, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateJwt(email: string): string {
  return jwt.sign({ email }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpires,
  });
}

export function setAuthCookie<T extends DefaultContext>(ctx: T, token: string) {
  ctx.cookies.set(AUTH_COOKIE_NAME, token, {
    maxAge: authConfig.jwtExpires * 1000,
  });
}
