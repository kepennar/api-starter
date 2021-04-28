import { User } from "@agado/model";
import { Prisma } from "@prisma/client";
import { decrypt, encrypt } from "../utils/crypto.utilities";
import { fromJsonValueAvatarImages } from "./resizedImage.converter";

export type WithoutAvatarImageUser = Omit<User.User, "avatarImages"> & {
  avatarImages?: Prisma.JsonValue;
};

export function convertUser(user: WithoutAvatarImageUser): User.User {
  const decryptedUser = decryptUser(user);
  if (user.avatarImages && fromJsonValueAvatarImages(user.avatarImages)) {
    return decryptedUser as User.User;
  }
  return { ...decryptedUser, avatarImages: null };
}

interface ToBeEncryptedUserFields {
  name?: string;
}

export function encryptUser<T extends ToBeEncryptedUserFields>(
  userFields: T
): T {
  return {
    ...userFields,
    name: userFields.name ? encrypt(userFields.name) : undefined,
  };
}

export function decryptUser<T extends ToBeEncryptedUserFields>(
  userFields: T
): T {
  return {
    ...userFields,
    name: userFields.name ? decrypt(userFields.name) : undefined,
  };
}
