import { Errors, ID, User, Search } from "@agado/model";
import { EmailTokenType, Prisma, Role } from "@prisma/client";
import { hashPassword } from "../auth/auth.utilities";
import { tokenService } from "../auth/token.service";
import { config } from "../config";
import {
  convertUser,
  decryptUser,
  encryptUser,
} from "../converter/user.converters";
import { prisma } from "../db/client";
import { ApiError, UnauthorizedError } from "../errors/Errors";
import { generatePermissionScope } from "../file-storage/fileStorage.model";
import { logger } from "../logger";
import { changePasswordMail, sendWelcomeMail } from "../mail";
import { createPageInfo } from "../utils/pagination.utilities";
import { parseSearchQuery, toDeletedClause } from "../utils/searchUtilities";

const appConfig = config.get("app");

export const USER_FIELDS_TO_SELECT = {
  id: true,
  email: true,
  name: true,
  avatarImages: true,
  roles: true,
  activated: true,
  deleted: true,
  updatedAt: true,
  createdAt: true,
};

function hasUserRoles(
  { roles: userRoles }: { roles: Role[] },
  roles: Role[]
): boolean {
  return userRoles.some((role) => roles.includes(role));
}

function hasUserOnlyRole(
  { roles: userRoles }: { roles: Role[] },
  role: Role
): boolean {
  return userRoles.every((userRole) => userRole === role);
}

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];
function isUserAdmin(user: { roles: Role[] }) {
  return hasUserRoles(user, ADMIN_ROLES);
}

async function init() {
  const existingSuperAdminUser = await prisma.user.findFirst({
    where: {
      roles: { has: "SUPER_ADMIN" },
    },
  });

  const superAdminEmail = appConfig.superAdminEmail;

  if (!superAdminEmail && !existingSuperAdminUser) {
    logger.warn("No SuperAdmin user in db. You should create one");
    return;
  }

  if (existingSuperAdminUser) {
    logger.info(
      `SuperAdmin user already exist with email "${existingSuperAdminUser.email}"`
    );
    return;
  }

  await prisma.user.create({
    data: encryptUser({
      email: superAdminEmail,
      name: "SUPER ADMIN",
      roles: [Role.SUPER_ADMIN, Role.ADMIN],
      activated: true,
    }),
  });
  logger.info(`SuperAdmin user created with email "${superAdminEmail}"`);
}

function getInitalFilePermissionTicketsPerRole(
  creator: User.User,
  role: Role,
  userId: ID
): Prisma.FilePermissionTicketCreateManyInput[] {
  switch (role) {
    case "USER":
      return [
        {
          bucketName: "media_resume",
          permissionScope: generatePermissionScope("user", userId),
          userId,
          updatedByUserId: creator.id,
        },
      ];
    case "SUPER_ADMIN":
    case "ADMIN":
      return [
        {
          bucketName: "app_avatar",
          permissionScope: "*",
          userId,
          updatedByUserId: creator.id,
        },
        {
          bucketName: "media_resume",
          permissionScope: "*",
          userId,
          updatedByUserId: creator.id,
        },
      ];
  }
}

async function createUser(creator: User.User, userInput: User.CreateUserBody) {
  const token = tokenService.generateEmailToken(EmailTokenType.ACTIVATION);

  const userFields = encryptUser(userInput);

  const isEmailWorkflowActivated = userService.hasUserRoles(
    userFields,
    appConfig.accountCreationWorkflowActivatedFor
  );
  try {
    const { user } = await prisma.emailToken.create({
      select: {
        user: {
          select: USER_FIELDS_TO_SELECT,
        },
      },
      data: {
        type: token.type,
        tokenValue: token.tokenValue,
        expiration: token.expiration,
        active: true,
        user: {
          create: {
            ...userFields,
            activated: !isEmailWorkflowActivated,
          },
        },
      },
    });

    // Create default permissionTicket for newly created user
    const userFilePermissionTickets = userFields.roles.flatMap((role) =>
      getInitalFilePermissionTicketsPerRole(creator, role, user.id)
    );
    await prisma.filePermissionTicket.createMany({
      data: userFilePermissionTickets,
    });

    if (isEmailWorkflowActivated) {
      await sendWelcomeMail({ ...convertUser(user), token: token.tokenValue });
    }
    return convertUser(user);
  } catch (error) {
    if (error.code === "P2002") {
      throw new ApiError(
        Errors.ApiErrorCode.AUTHENT_ALLREADY_EXISTING_USER,
        error,
        {
          statusCode: 409,
          message: "A user with this email already exists",
        }
      );
    }
    throw error;
  }
}

async function getTokenUser(emailToken: string) {
  const token = await tokenService.findValidEmailToken(
    emailToken,
    EmailTokenType.ACTIVATION
  );

  if (!token) {
    throw new ApiError(
      Errors.ApiErrorCode.DATA_WRONG_REQUEST,
      "Wrong token in request",
      {
        statusCode: 404,
      }
    );
  }

  const user = await prisma.user.findFirst({
    select: USER_FIELDS_TO_SELECT,
    where: {
      emailTokens: {
        some: token,
      },
    },
  });
  if (!user) {
    throw new ApiError(
      Errors.ApiErrorCode.DATA_WRONG_REQUEST,
      "Wrong token in request",
      {
        statusCode: 404,
      }
    );
  }
  return decryptUser(user);
}

async function activateAccount({
  password,
  token: emailToken,
}: User.ActivateBody) {
  const hashedPassword = await hashPassword(password);

  const token = await tokenService.findValidEmailToken(
    emailToken,
    EmailTokenType.ACTIVATION
  );

  if (!token) {
    throw new ApiError(
      Errors.ApiErrorCode.DATA_WRONG_REQUEST,
      "Wrong token in request",
      {
        statusCode: 404,
      }
    );
  }
  await prisma.emailToken.update({
    where: {
      id: token.id,
    },
    data: {
      active: false,
      user: {
        update: {
          activated: true,
          password: hashedPassword,
        },
      },
    },
  });
}

async function sendRenewPassword(email: string) {
  const { tokenValue, expiration, type } = tokenService.generateEmailToken(
    EmailTokenType.RENEW_PASSWORD
  );

  const { tokenValue: token, user } = await prisma.emailToken.create({
    select: { tokenValue: true, user: { select: USER_FIELDS_TO_SELECT } },
    data: {
      type,
      tokenValue,
      expiration,
      user: {
        connect: { email },
      },
    },
  });
  await changePasswordMail({ ...convertUser(user), token });
}

async function changePassword({
  token: emailToken,
  newPassword,
}: User.ChangePasswordBody) {
  const token = await tokenService.findValidEmailToken(
    emailToken,
    EmailTokenType.RENEW_PASSWORD
  );

  if (!token) {
    throw new ApiError(
      Errors.ApiErrorCode.DATA_WRONG_REQUEST,
      "Wrong token in request",
      {
        statusCode: 404,
      }
    );
  }
  const hashedPassword = await hashPassword(newPassword);
  await prisma.emailToken.update({
    where: {
      id: token.id,
    },
    data: {
      active: false,
      user: {
        update: {
          password: hashedPassword,
        },
      },
    },
  });
}

async function closeAccount(
  authenticatedUser?: User.User,
  userIdToBeDeleted?: string
) {
  const isAdmin = authenticatedUser ? isUserAdmin(authenticatedUser) : false;
  if (isAdmin && authenticatedUser?.id !== userIdToBeDeleted) {
    throw new UnauthorizedError(Errors.ApiErrorCode.AUTHENT_UNAUTHORIZED);
  }
  await prisma.$transaction([
    prisma.emailToken.deleteMany({
      where: {
        userId: userIdToBeDeleted,
      },
    }),
    prisma.user.update({
      where: { id: userIdToBeDeleted },
      data: { deleted: new Date() },
    }),
  ]);
}

async function getUserAsAdmin(
  requester: User.User,
  by: { id?: string; email?: string }
) {
  if (!userService.hasUserRoles(requester, ["ADMIN"])) {
    throw new ApiError(
      Errors.ApiErrorCode.AUTHENT_UNAUTHORIZED,
      "You're not a granted role"
    );
  }
  const dbUser = await prisma.user.findUnique({
    select: USER_FIELDS_TO_SELECT,
    where: by,
  });
  return dbUser ? convertUser(dbUser) : null;
}

async function findUser(
  requester: User.User,
  by: { id?: string; email?: string }
) {
  if (userService.hasUserRoles(requester, ["ADMIN"])) {
    return getUserAsAdmin(requester, by);
  }

  throw new ApiError(
    Errors.ApiErrorCode.API_ERROR,
    "Not yet implemented for you"
  );
}

async function deleteUser(by: { id?: string; email?: string }) {
  await prisma.user.update({
    where: by,
    data: {
      deleted: new Date(),
    },
  });
}

async function undeleteUser(by: { id?: string; email?: string }) {
  await prisma.user.update({
    where: by,
    data: {
      deleted: null,
    },
  });
}

async function countUsers(withDeleted: boolean) {
  return prisma.user.count({
    where: {
      deleted: !withDeleted ? null : undefined,
    },
  });
}

async function searchUsers({ filters, take, skip }: Search.SearchParams) {
  const deleted = toDeletedClause(filters?.deleted);
  const searchQuery = parseSearchQuery(
    [{ name: "companyId" }, { name: "roles", isArray: true }],
    filters?.query
  );

  const whereClause = {
    deleted,
    companyId: searchQuery?.companyId,
    roles: searchQuery?.roles.length
      ? { hasSome: searchQuery.roles as Role[] }
      : undefined,
  };

  const count = await prisma.user.count({ where: whereClause });
  const users = await prisma.user.findMany({
    select: USER_FIELDS_TO_SELECT,
    where: whereClause,
    orderBy: { updatedAt: "desc" },
    skip: skip || 0,
    take: take || 10,
  });
  return {
    data: users.map((user) => convertUser(user)),
    pageInfo: createPageInfo(users, { take, skip, count }),
  };
}

async function updateUser(
  by: { email?: string; id?: string },
  userFields: {
    name?: string;
    avatarImages?: Prisma.JsonValue | null;
  }
) {
  const dbUser = await prisma.user.update({
    select: USER_FIELDS_TO_SELECT,
    where: by,
    data: encryptUser(userFields),
  });

  return convertUser(dbUser);
}

async function adminUpdateUser(
  by: { email?: string; id?: string },
  updateUserFields: {
    name?: string;
    roles?: Role[];
    companyId?: string;
    groups?: string[];
  }
) {
  const { companyId, groups, ...fields } = encryptUser(updateUserFields);

  const dbUser = await prisma.user.update({
    select: USER_FIELDS_TO_SELECT,
    where: by,
    data: fields,
  });

  return convertUser(dbUser);
}

async function getUserPermissionTickets(userId: ID) {
  return prisma.filePermissionTicket.findMany({ where: { userId } });
}

async function saveUserResume(userId: ID, storageFileId: string) {
  const existingResume = await prisma.file.findFirst({
    where: {
      ownerId: userId,
      deleted: null,
    },
  });
  if (existingResume) {
    return prisma.file.update({
      where: { id: existingResume.id },
      data: { storageFileId },
    });
  }
  return prisma.file.create({
    data: {
      name: "Resume",
      type: "PDF",
      labels: ["RESUME"],
      storageFileId,
      ownerId: userId,
      updatedByUserId: userId,
    },
  });
}

async function deleteFile(deletor: User.User, fileId: ID) {
  return prisma.file.update({
    where: { id: fileId },
    data: {
      deleted: new Date(),
      updatedByUserId: deletor.id,
    },
  });
}

async function getUserResume(userId: ID) {
  return prisma.file.findFirst({
    where: { ownerId: userId, labels: { has: "RESUME" }, deleted: null },
  });
}

export const userService = {
  init,
  hasUserRoles,
  hasUserOnlyRole,
  isUserAdmin,
  createUser,
  activateAccount,
  getTokenUser,
  sendRenewPassword,
  changePassword,
  closeAccount,
  findUser,
  countUsers,
  searchUsers,
  updateUser,
  deleteUser,
  undeleteUser,
  adminUpdateUser,
  getUserPermissionTickets,
  saveUserResume,
  deleteFile,
  getUserResume,
};
