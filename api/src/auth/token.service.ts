import { Errors, ID, User } from "@agado/model";
import { EmailToken, EmailTokenType } from "@prisma/client";
import { add, addSeconds } from "date-fns";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { convertUser } from "../converter/user.converters";
import { prisma } from "../db/client";
import { UnauthorizedError } from "../errors/Errors";
import { logger } from "../logger";
import { USER_FIELDS_TO_SELECT } from "../services/user.service";
import { EmailTokenMetadata } from "./model/auth.model";

const authConfig = config.get("auth");
const emailConfig = config.get("mail");

function generateEmailToken(type: EmailTokenType): EmailTokenMetadata {
  const tokenValue = Math.floor(10000000 + Math.random() * 90000000).toString();
  const expiration = add(new Date(), {
    minutes: emailConfig.mailTokenExpiration,
  });

  return {
    tokenValue,
    expiration,
    type,
  };
}

async function findValidEmailToken(
  tokenValue: string,
  type: EmailTokenType
): Promise<EmailToken | null> {
  return prisma.emailToken.findFirst({
    where: {
      tokenValue,
      type,
      active: true,
      expiration: {
        gt: new Date(),
      },
    },
  });
}

async function findUserByValidAuthToken(jwtId: ID) {
  const response = await prisma.authToken.findFirst({
    select: { user: { select: USER_FIELDS_TO_SELECT } },
    where: {
      jwtId,
      expiration: {
        gt: new Date(),
      },
    },
  });
  return response?.user ? convertUser(response.user) : null;
}

async function generateAuthToken(user: User.User): Promise<string> {
  const { id: userId, email, roles } = user;
  const { jwtId } = await prisma.authToken.create({
    select: {
      jwtId: true,
    },
    data: {
      expiration: addSeconds(new Date(), authConfig.jwtExpires),
      user: { connect: { id: userId } },
    },
  });

  return jwt.sign({ userId, email, roles }, authConfig.jwtSecret, {
    jwtid: jwtId,
    expiresIn: authConfig.jwtExpires,
  });
}

async function refreshAuthToken(jwtId: ID) {
  const authToken = await prisma.authToken.findFirst({
    select: {
      id: true,
      user: { select: USER_FIELDS_TO_SELECT },
    },
    where: {
      jwtId,
      expiration: {
        gt: new Date(),
      },
    },
  });
  if (!authToken || authToken.user.deleted) {
    logger.info("Attempt to refresh to an inexistant or deleted account");
    throw new UnauthorizedError(
      authToken
        ? Errors.ApiErrorCode.AUTHENT_ACCOUNT_DEACTIVATED
        : Errors.ApiErrorCode.AUTHENT_WRONG_CREDENTIALS
    );
  }
  await prisma.authToken.delete({
    where: {
      id: authToken.id,
    },
  });
  return generateAuthToken(convertUser(authToken.user));
}

async function deleteUserAuthToken(user: User.User) {
  await prisma.authToken.deleteMany({
    where: {
      userId: user.id,
    },
  });
}

async function deleteAuthTokenById(tokenId: ID) {
  await prisma.authToken.delete({
    where: {
      id: tokenId,
    },
  });
}

async function findAuthTokenByUserId(userId: ID) {
  return prisma.authToken.findMany({
    where: {
      userId,
    },
  });
}

async function removeExpiredToken() {
  const [authTokenDeleted, emailTokenDeleted] = await prisma.$transaction([
    prisma.authToken.deleteMany({
      where: {
        expiration: {
          lt: new Date(),
        },
      },
    }),
    prisma.emailToken.deleteMany({
      where: {
        expiration: {
          lt: new Date(),
        },
      },
    }),
  ]);
  return authTokenDeleted.count + emailTokenDeleted.count;
}

export const tokenService = {
  generateEmailToken,
  findValidEmailToken,
  findUserByValidAuthToken,
  generateAuthToken,
  refreshAuthToken,
  deleteUserAuthToken,
  deleteAuthTokenById,
  findAuthTokenByUserId,
  removeExpiredToken,
};
