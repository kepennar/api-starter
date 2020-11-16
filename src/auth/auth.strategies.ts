import passport from "koa-passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions,
} from "passport-jwt";
import { config } from "../config";
import { prisma } from "../prisma";

const authConfig = config.get("auth");

export const AUTH_COOKIE_NAME = "token";

const jwtStrategyOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    function (req) {
      return req && req.cookies.get(AUTH_COOKIE_NAME);
    },
  ]),
  secretOrKey: authConfig.jwtSecret,
};
passport.use(
  new JwtStrategy(jwtStrategyOptions, async (jwtPayload, done) => {
    const user = await prisma.user.findOne({
      where: { email: jwtPayload.email },
    });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } else {
      done(null, false);
    }
  })
);
