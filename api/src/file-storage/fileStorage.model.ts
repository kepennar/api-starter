import { ID } from "@agado/model";
import type { BucketName } from "@prisma/client";
import type { Readable as ReadableStream } from "stream";

type Scope = "admin" | "user"
export type PermissionScope = `scope:${Scope}:id:${ID}` | "*";

export interface FileStorageMetadata {
  ContentType: string;
  encoding: string;
  filename: string;
  userId: ID;
  scopes: PermissionScope[];
}
export interface FileStorageObject {
  bucketName: BucketName;
  objectName: string;
  stream: ReadableStream | Buffer | string;
  metadata: FileStorageMetadata;
}

export type ObjectId = string;

export interface ResizedImage {
  originalObjectId: ObjectId;
  mediumObjectId: ObjectId;
  smallObjectId: ObjectId;
}

export function generatePermissionScope(scope: Scope, id: ID): PermissionScope {
  return `scope:${scope}:id:${id}` as PermissionScope;
}
