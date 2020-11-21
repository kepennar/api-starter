import { Middleware } from "koa";
import passport from "koa-passport";
import compose from "koa-compose";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions,
} from "passport-jwt";
import { config } from "../config";
import { prisma } from "../prisma";
import { generateJwt, setAuthCookie } from "./auth.utilities";
import { JwtPayload } from "./model/JwtPayload";
import { logger } from "../logger";

const authConfig = config.get("auth");

export const AUTH_COOKIE_NAME = "token";

const jwtStrategyOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    function (req) {
      return req && req.cookies.get(AUTH_COOKIE_NAME);
    },
  ]),
  secretOrKey: authConfig.jwtSecret || undefined,
};
passport.use(
  new JwtStrategy(jwtStrategyOptions, async (jwtPayload: JwtPayload, done) => {
    const user = await prisma.user.findOne({
      where: { email: jwtPayload.email },
    });
    if (user && !user.deleted) {
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } else {
      done(null, false);
    }
  })
);

const refreshTokenMiddleware: Middleware = async (context, next) => {
  const userEmail = context.state.user.email;
  const token = generateJwt(userEmail);
  setAuthCookie(context, token);
  await next();
};

/**
 * Implements Sliding sessions
 */
export const authenticationMiddleware = compose([
  passport.authenticate("jwt", { session: false }),
  refreshTokenMiddleware,
]);
