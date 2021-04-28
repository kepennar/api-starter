import * as Yup from "yup";
import { ID } from "../common/scalars";

export type AuthMode = "cookies" | "header";

export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

export const ROLES: Role[] = ["ADMIN", "USER"];

export interface AuthTokenClaims {
  userId: ID;
  email: string;
  roles: Role[];
  iat: number;
  exp: number;
  jti: string;
}

export type AuthToken = {
  id: ID;
  jwtId: string;
  expiration: Date;
};

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W|_]).{8,}$/g;

export interface AuthBody {
  email: string;
  password: string;
}

export const AuthBodyValidationSchema: Yup.SchemaOf<AuthBody> = Yup.object()
  .shape({
    email: Yup.string().required("Email mandatory"),
    password: Yup.string().required("Password mandatory"),
  })
  .required();

export function validateAuthBody(body: unknown): AuthBody {
  return AuthBodyValidationSchema.validateSync(body, {
    abortEarly: false,
  });
}
