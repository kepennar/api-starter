import Router from "koa-router";
import passport from "koa-passport";
import { prisma } from "../../prisma";
import bcrypt from "bcrypt";
import {
  comparePassword,
  generateJwt,
  hashPassword,
} from "../../auth/auth.utilities";
import { ApiError } from "../../errors";
import { validateAuthBody, validateRegisterBody } from "./model/Auth.body";
import { AUTH_COOKIE_NAME } from "../../auth/auth.strategies";

export const authRouter = new Router();

authRouter.post("/login", async (ctx) => {
  const { email, password } = validateAuthBody(ctx.request.body);

  const user = await prisma.user.findOne({ where: { email } });
  const passwordMatch = await comparePassword(password, user.password);

  if (user && passwordMatch) {
    const token = generateJwt(email);
    ctx.cookies.set(AUTH_COOKIE_NAME, token);
    ctx.body = { ...user };
  } else {
    ctx.throw(
      new ApiError(new Error("login password error"), { statusCode: 403 })
    );
  }
});

authRouter.post("/register", async (ctx) => {
  try {
    const { password, ...rest } = validateRegisterBody(ctx.request.body);

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { ...rest, password: hashedPassword },
    });

    ctx.status = 201;
    ctx.body = user;
  } catch (error) {
    if (error.code === "P2002") {
      throw new ApiError(error, {
        statusCode: 409,
        message: "A user with this email allrady exists",
      });
    }
    throw error;
  }
});

authRouter.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    ctx.body = ctx.state.user;
  }
);
