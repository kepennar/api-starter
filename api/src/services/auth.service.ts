import { Auth, Errors, User } from "@agado/model";
import { comparePassword } from "../auth/auth.utilities";
import { tokenService } from "../auth/token.service";
import { convertUser } from "../converter/user.converters";
import { prisma } from "../db/client";
import { UnAuthenticatedError, UnauthorizedError } from "../errors/Errors";
import { USER_FIELDS_TO_SELECT } from "./user.service";

async function login({ email, password }: Auth.AuthBody) {
  const dbUser = await prisma.user.findUnique({
    select: { ...USER_FIELDS_TO_SELECT, password: true },
    where: { email },
  });
  if (!dbUser || dbUser.deleted || !dbUser.activated || !dbUser.password) {
    throw new UnauthorizedError(
      dbUser
        ? Errors.ApiErrorCode.AUTHENT_ACCOUNT_DEACTIVATED
        : Errors.ApiErrorCode.AUTHENT_WRONG_CREDENTIALS
    );
  }

  const passwordMatch = await comparePassword(dbUser.password, password);

  if (!passwordMatch) {
    throw new UnAuthenticatedError(
      Errors.ApiErrorCode.AUTHENT_WRONG_CREDENTIALS
    );
  }

  const token = await tokenService.generateAuthToken(convertUser(dbUser));
  return { user: dbUser, token };
}

async function logout(user: User.User) {
  await tokenService.deleteUserAuthToken(user);
}

export const authService = {
  login,
  logout,
};
