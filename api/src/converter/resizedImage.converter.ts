import { Image } from "@agado/model";
import { Prisma } from "@prisma/client";
import { is, object, string } from "superstruct";
import { logger } from "../logger";

const ResizedImageStruct = object({
  small: string(),
  medium: string(),
  large: string(),
  original: string(),
});

export function isResizedImage(data: unknown): data is Image.ResizedImage {
  return is(data, ResizedImageStruct);
}

export function fromJsonValueAvatarImages(
  data: Prisma.JsonValue
): Image.ResizedImage | null {
  if (isResizedImage(data)) {
    return data;
  } else {
    logger.warn("Invalid resizedImages JsonValue", data);
  }
  return null;
}
