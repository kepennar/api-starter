import type { BucketName, FilePermissionTicket } from "@prisma/client";
import { PermissionScope } from "./fileStorage.model";

function isGranted(
  bucketName: BucketName,
  scopes: PermissionScope[],
  userPermissionTickets: FilePermissionTicket[]
): boolean {
  // Public resource for all
  if (scopes.includes("*")) {
    return true;
  }
  return userPermissionTickets.some(
    (permissionTicket) =>
      permissionTicket.bucketName === bucketName &&
      scopes.includes(permissionTicket.permissionScope as PermissionScope)
  );
}

export const filePermissionGuard = {
  isGranted,
};
