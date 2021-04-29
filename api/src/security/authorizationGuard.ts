import { Errors, ID } from "@agado/model";
import { Role } from "@prisma/client";
import { ApiError } from "../errors/Errors";
import { logger } from "../logger";
import { userService } from "../services/user.service";

/** Currently an admin or a trainer can access all data  */

export function containOnlyId(ids: ID[], id: ID): boolean {
  return ids.every((arrayId) => arrayId === id);
}

function aUserCanAccessOnlyItsOwnData(
  user: { id: ID; roles: Role[] },
  traineeIdsFilter?: ID[] | null
) {
  if (userService.hasUserRoles(user, ["ADMIN"])) {
    return;
  }

  const isAllowed =
    !!traineeIdsFilter && containOnlyId(traineeIdsFilter, user.id);
  if (!isAllowed) {
    logger.warn(
      `A trainee (id=${user.id})  tries to access data that does not belong to him`
    );
    throw new ApiError(
      Errors.ApiErrorCode.AUTHENT_UNAUTHORIZED,
      "A trainee can only get its own sessions"
    );
  }
}

export const authorizationGuards = {
  aUserCanAccessOnlyItsOwnData,
};
