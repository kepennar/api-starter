import { Role } from "@prisma/client";
import Router from "koa-router";
import { logger } from "../../logger";
import {
  authenticationMiddleware,
  AUTH_COOKIE_NAME,
} from "../../auth/auth.strategies";
import {
  comparePassword,
  generateJwt,
  hashPassword,
  setAuthCookie,
} from "../../auth/auth.utilities";
import { ApiState } from "../../auth/model/JwtPayload";
import { ApiError } from "../../errors";
import { prisma } from "../../prisma";
import { validateAuthBody, validateRegisterBody } from "./model/Auth.body";

export const authRouter = new Router<ApiState>();

authRouter.post("/login", async (ctx) => {
  const { email, password } = validateAuthBody(ctx.request.body);

  const user = await prisma.user.findOne({ where: { email } });
  if (!user || user.deleted) {
    logger.info("Attempt to connect to an inexistant or deleted account");
    ctx.throw(new ApiError(new Error("login error"), { statusCode: 403 }));
    return;
  }
  const passwordMatch = await comparePassword(password, user.password);

  if (passwordMatch) {
    const token = generateJwt(email);
    setAuthCookie(ctx, token);
    ctx.body = { ...user };
  } else {
    ctx.throw(new ApiError(new Error("login error"), { statusCode: 403 }));
  }
});

authRouter.post("/logout", async (ctx) => {
  ctx.cookies.set(AUTH_COOKIE_NAME);
  ctx.status = 204;
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

authRouter.post("/close/:uuid", authenticationMiddleware, async (ctx) => {
  const authenticatedUser = ctx.state.user;
  const userIdToBeDeleted = ctx.params.uuid;

  if (
    authenticatedUser?.role === Role.ADMIN ||
    authenticatedUser?.id === userIdToBeDeleted
  ) {
    await prisma.user.update({
      where: { id: userIdToBeDeleted },
      data: { deleted: new Date() },
    });
    ctx.status = 204;
  } else {
    ctx.status = 403;
  }
});
