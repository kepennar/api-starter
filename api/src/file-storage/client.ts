import * as Minio from "minio";
import { logger } from "../logger";
import { config } from "../config";
import {
  FileStorageMetadata,
  FileStorageObject,
  ObjectId,
} from "./fileStorage.model";
import { UnauthorizedError } from "../errors/Errors";
import { Errors } from "@agado/model";
import { BucketName, FilePermissionTicket } from "@prisma/client";
import { filePermissionGuard } from "./filePermission.guard";

const fileStorageConfig = config.get("fileStorage");
const appConfig = config.get("app");

const DB_BUCKET_NAME_TO_S3_BUCKET_NAME: { [dbName in BucketName]: string } = {
  app_avatar: `jpf-app-avatar-${appConfig.env.toLowerCase()}`,
  media_resume: `jpf-media-resume-${appConfig.env.toLowerCase()}`,
};

function isABucketNameGuard(value: string): value is BucketName {
  return Object.keys(DB_BUCKET_NAME_TO_S3_BUCKET_NAME).includes(value);
}

const minioClient = new Minio.Client({
  endPoint: fileStorageConfig.url,
  port: fileStorageConfig.port,
  useSSL: ["DEV", "TEST"].includes(appConfig.env) ? false : true,
  accessKey: fileStorageConfig.accessKey,
  secretKey: fileStorageConfig.secretKey,
});

export const fileStorageClient = {
  async init() {
    for (const bucketName of Object.values(DB_BUCKET_NAME_TO_S3_BUCKET_NAME)) {
      if (!(await minioClient.bucketExists(bucketName))) {
        /**
         * Cette action ne fonctionne pas sur Cellar
         */
        await minioClient.makeBucket(bucketName, "");
      }
    }
  },

  async storeObject({
    bucketName,
    objectName,
    stream,
    metadata,
  }: FileStorageObject): Promise<ObjectId> {
    const s3BucketName = DB_BUCKET_NAME_TO_S3_BUCKET_NAME[bucketName];

    const id = await minioClient.putObject(
      s3BucketName,
      objectName,
      stream,
      metadata
    );
    logger.debug("[File-storage] object stored with etag", id);
    return `${bucketName}/${objectName}`;
  },

  async getObject(fileSrc: string, filePermissions: FilePermissionTicket[]) {
    const [bucketName, objectName] = fileSrc.split("/");

    if (!isABucketNameGuard(bucketName)) {
      throw new Error(`Invalid bucketName "${bucketName}"`);
    }
    const s3BucketName = DB_BUCKET_NAME_TO_S3_BUCKET_NAME[bucketName];
    const objStat = await minioClient.statObject(s3BucketName, objectName);
    const metadata = deserializeToFileMetadata(objStat.metaData);

    if (
      !filePermissionGuard.isGranted(
        bucketName,
        metadata.scopes,
        filePermissions
      )
    ) {
      throw new UnauthorizedError(
        Errors.ApiErrorCode.AUTHENT_UNAUTHORIZED,
        "Unauthorized"
      );
    }

    const obj = await minioClient.getObject(s3BucketName, objectName);
    return obj;
  },

  async rmObject(bucketName: BucketName, ...objectIds: ObjectId[]) {
    const s3BucketName = DB_BUCKET_NAME_TO_S3_BUCKET_NAME[bucketName];
    await minioClient.removeObjects(s3BucketName, objectIds);
  },
};

function deserializeToFileMetadata(
  objMeta: Minio.ItemBucketMetadata
): FileStorageMetadata {
  return {
    ...objMeta,
    scopes: objMeta?.scopes.split(","),
  } as FileStorageMetadata;
}
