import { ID, Image, User } from "@agado/model";
import { FileLabel, FileType } from "@prisma/client";
import intoStream from "into-stream";
import { File } from "koa-multer";
import type { Readable as ReadableStream } from "stream";
import { convertUser } from "../../converter/user.converters";
import { prisma } from "../../db/client";
import { fileStorageClient } from "../../file-storage/client";
import { generatePermissionScope } from "../../file-storage/fileStorage.model";
import { cropImage, resizeImage } from "../../image/image.resizer";
import { USER_FIELDS_TO_SELECT } from "../../services/user.service";
import {
  createPageInfo,
  PaginationQuery,
} from "../../utils/pagination.utilities";
import { toDeletedClause } from "../../utils/searchUtilities";

interface SearchMediasFilters {
  type?: FileType;
  labels?: FileLabel[];
  userIds?: string[];
  deleted?: boolean | null;
}
async function searchMedias(
  { take, skip }: PaginationQuery,
  filters?: SearchMediasFilters
) {
  const deletedClause = toDeletedClause(filters?.deleted);

  const whereFilters = {
    type: filters?.type,
    labels: filters?.labels?.length ? { hasSome: filters.labels } : undefined,
    traineeId: filters?.userIds?.length ? { in: filters.userIds } : undefined,
  };

  const whereClause = { deleted: deletedClause, ...whereFilters };
  const count = await prisma.file.count({ where: whereClause });
  const medias = await prisma.file.findMany({
    where: whereClause,
    orderBy: [{ updatedAt: "desc" }],
    skip: skip || 0,
    take: take || 10,
  });
  return {
    data: medias,
    pageInfo: createPageInfo(medias, { take, skip, count }),
  };
}

async function countMedias(withDeleted?: boolean) {
  const deletedClause = toDeletedClause(withDeleted);
  return prisma.file.count({ where: { deleted: deletedClause } });
}

async function deleteMedia(mediaId: ID) {
  return prisma.file.update({
    data: { deleted: new Date() },
    where: { id: mediaId },
  });
}

async function restoreMedia(mediaId: ID) {
  return prisma.file.update({
    data: { deleted: null },
    where: { id: mediaId },
  });
}

interface FileMetadata {
  mimetype: string;
  encoding: string;
  filename: string;
}
async function storeAvatarImage(
  user: User.User,
  resourceId: ID,
  imageStream: ReadableStream,
  { mimetype, encoding, filename }: FileMetadata,
  size: "original" | "large" | "medium" | "small",
  unsecured = false
) {
  return await fileStorageClient.storeObject({
    bucketName: "app_avatar",
    objectName: `${Date.now()}-${resourceId}-${size}`,
    stream: imageStream,
    metadata: {
      ContentType: mimetype,
      encoding,
      filename,
      userId: user.id,
      scopes: unsecured ? ["*"] : [generatePermissionScope("user", resourceId)],
    },
  });
}

async function createAndStoreAvatarImage(
  user: User.User,
  resourceId: ID,
  upload: File,
  cropData: Image.CropData,
  unsecured = false
) {
  const { filename, mimetype, encoding, buffer } = upload;

  const imageStream = intoStream(buffer);

  const croppedImage = await cropImage(imageStream, cropData);
  const {
    smallImage,
    mediumImage,
    largeImage,
    originalImage,
  } = await resizeImage(croppedImage);

  const [small, medium, large, original] = await Promise.all([
    storeAvatarImage(
      user,
      resourceId,
      smallImage,
      { mimetype, encoding, filename },
      "small",
      unsecured
    ),
    storeAvatarImage(
      user,
      resourceId,
      mediumImage,
      { mimetype, encoding, filename },
      "medium",
      unsecured
    ),
    storeAvatarImage(
      user,
      resourceId,
      largeImage,
      { mimetype, encoding, filename },
      "large",
      unsecured
    ),
    storeAvatarImage(
      user,
      resourceId,
      originalImage,
      { mimetype, encoding, filename },
      "original",
      unsecured
    ),
  ]);
  return { small, medium, large, original };
}

async function storeResume(user: User.User, upload: File) {
  const { filename, mimetype, encoding, buffer } = upload;

  return fileStorageClient.storeObject({
    bucketName: "media_resume",
    objectName: `${Date.now()}-${user.email}`,
    stream: buffer,
    metadata: {
      ContentType: mimetype,
      encoding,
      filename,
      userId: user.id,
      scopes: [generatePermissionScope("user", user.id)],
    },
  });
}

async function rmAvatarImage({
  original,
  large,
  medium,
  small,
}: Image.ResizedImage) {
  await fileStorageClient.rmObject(
    "app_avatar",
    original,
    large,
    medium,
    small
  );
}

async function getFileOwner(fileId: ID) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: {
      owner: { select: USER_FIELDS_TO_SELECT },
    },
  });
  return file ? convertUser(file.owner) : undefined;
}

export const mediaService = {
  searchMedias,
  countMedias,
  deleteMedia,
  restoreMedia,
};
