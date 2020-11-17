import Router from "koa-router";
import passport from "koa-passport";
import { prisma } from "../../prisma";
import {
  comparePassword,
  generateJwt,
  hashPassword,
  setAuthCookie,
} from "../../auth/auth.utilities";
import { ApiError } from "../../errors";
import { validateAuthBody, validateRegisterBody } from "./model/Auth.body";
import { authenticationMiddleware } from "../../auth/auth.strategies";

export const authRouter = new Router();

authRouter.post("/login", async (ctx) => {
  const { email, password } = validateAuthBody(ctx.request.body);

  const user = await prisma.user.findOne({ where: { email } });
  const passwordMatch = await comparePassword(password, user.password);

  if (user && passwordMatch) {
    const token = generateJwt(email);
    setAuthCookie(ctx, token);
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
        message: "A user with this email already exists",
      });
    }
    throw error;
  }
});

authRouter.get("/me", authenticationMiddleware, async (ctx) => {
  ctx.body = ctx.state.user;
});
