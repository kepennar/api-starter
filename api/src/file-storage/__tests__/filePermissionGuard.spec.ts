import { filePermissionGuard } from "../filePermission.guard";
import { generatePermissionScope } from "../fileStorage.model";

describe("filePermissionGuard", () => {
  it("should grant a public ressource for all", () => {
    expect(filePermissionGuard.isGranted("app_avatar", ["*"], [])).toBeTruthy();
  });

  it("should grant an avatar for a user only", () => {
    expect(
      filePermissionGuard.isGranted(
        "app_avatar",
        [generatePermissionScope("user", "fakeUserId")],
        [
          {
            bucketName: "app_avatar",
            id: "fakeId",
            userId: "fakeUserId",
            permissionScope: `scope:company:id:fakeUserId`,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedByUserId: "fakeUserId",
            deleted: null,
          },
        ]
      )
    ).toBeTruthy();
  });

  it("should no be granted for another user", () => {
    expect(
      filePermissionGuard.isGranted(
        "app_avatar",
        [generatePermissionScope("user", "fakeUserId")],
        [
          {
            bucketName: "app_avatar",
            id: "fakeId",
            userId: "fakeUserId",
            permissionScope: `scope:company:id:anotherUserId`,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedByUserId: "fakeUserId",
            deleted: null,
          },
          {
            bucketName: "media_resume",
            id: "fakeId",
            userId: "fakeUserId",
            permissionScope: `scope:company:id:anotherUserId`,
            createdAt: new Date(),
            updatedByUserId: "fakeUserId",
            updatedAt: new Date(),
            deleted: null,
          },
        ]
      )
    ).toBeFalsy();
  });
});
