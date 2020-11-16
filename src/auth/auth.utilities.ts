import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";

const authConfig = config.get("auth");

export async function hashPassword(
  nonEncodedPassword: string
): Promise<string> {
  const salt = await bcrypt.genSalt(authConfig.passwordSaltRounds);
  return bcrypt.hash(nonEncodedPassword, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
export function generateJwt(email: string): string {
  console.log("[DEBUG]", { jwtExpires: authConfig.jwtExpires });

  return jwt.sign({ email }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpires,
  });
}
