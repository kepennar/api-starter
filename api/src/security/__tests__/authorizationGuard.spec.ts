import { Role } from "@prisma/client";
import { authorizationGuards } from "../authorizationGuard";

describe("AuthorizationGuard", () => {
  it("should allowed a user to access its data", () => {
    const user = {
      id: "userId",
      roles: ["USER"] as Role[],
    };
    expect(() =>
      authorizationGuards.aUserCanAccessOnlyItsOwnData(user, ["userId"])
    ).not.toThrow();
  });

  it("should not allowed a user to access data does not belong data", () => {
    const user = {
      id: "userId",
      roles: ["USER"] as Role[],
    };
    expect(() =>
      authorizationGuards.aUserCanAccessOnlyItsOwnData(user, ["anotherUserId"])
    ).toThrow();
  });

  it("should not allowed a user to access data without filtering", () => {
    const user = {
      id: "userId",
      roles: ["USER"] as Role[],
    };
    expect(() =>
      authorizationGuards.aUserCanAccessOnlyItsOwnData(user)
    ).toThrow();
  });
});
