import crypto from "crypto";
import { config } from "../config";

const appConfig = config.get("app");
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const PARTS_SEPARATOR = ":";

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(appConfig.dataEncryptionKey),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}${PARTS_SEPARATOR}${encrypted.toString("hex")}`;
}

export function decrypt(text: string): string {
  const textParts = text.split(PARTS_SEPARATOR);

  const ivPart = textParts.shift();
  if (!ivPart) {
    throw new Error("Wrong encrypted data. Iv is missing");
  }
  const iv = Buffer.from(ivPart, "hex");
  const encryptedText = Buffer.from(textParts.join(PARTS_SEPARATOR), "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(appConfig.dataEncryptionKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
