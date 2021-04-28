import * as Yup from "yup";
import { AuthToken, Role, ROLES } from "../auth/auth.model";
import { ID } from "../common/scalars";
import { ResizedImage } from "../media/image.model";

export type User = {
  id: ID;
  email: string;
  name: string;
  roles: Role[];
  avatarImages?: ResizedImage | null;
  activated: boolean;
  deleted?: Date | null;
  updatedAt?: Date;
  createdAt: Date;
  authTokens?: AuthToken[];
};

export type CreateUserBody = {
  email: string;
  name: string;
  roles: Role[];
};
export const CreateUserBodyValidationSchema = Yup.object()
  .shape({
    email: Yup.string().required("Email mandatory"),
    name: Yup.string().required("Email mandatory"),
    roles: Yup.array()
      .of(Yup.string().oneOf(ROLES).required())
      .required("Roles mandatory")
      .min(1, "Roles at least 1"),
  })
  .required();

export function validateCreateUserBody(body: unknown): CreateUserBody {
  return CreateUserBodyValidationSchema.validateSync(body, {
    abortEarly: false,
  });
}

export interface ActivateBody {
  token: string;
  password: string;
}
export const ActivateBodyValidationSchema: Yup.SchemaOf<ActivateBody> = Yup.object()
  .shape({
    token: Yup.string().required("Token mandatory"),
    password: Yup.string().required("Password mandatory"),
  })
  .required();

export function validateActivateBody(body: unknown): ActivateBody {
  return ActivateBodyValidationSchema.validateSync(body, {
    abortEarly: false,
  });
}

export interface AskRenewPasswordBody {
  email: string;
}

export const AskRenewPasswordBodyValidationSchema: Yup.SchemaOf<AskRenewPasswordBody> = Yup.object()
  .shape({
    email: Yup.string().required("Email mandatory"),
  })
  .required();

export function validateAskRenewPasswordBody(
  body: unknown
): AskRenewPasswordBody {
  return AskRenewPasswordBodyValidationSchema.validateSync(body, {
    abortEarly: false,
  });
}

export interface ChangePasswordBody {
  token: string;
  newPassword: string;
}
export const ChangePasswordBodyValidationSchema: Yup.SchemaOf<ChangePasswordBody> = Yup.object()
  .shape({
    token: Yup.string().required("Token mandatory"),
    newPassword: Yup.string().required("New password mandatory"),
  })
  .required();

export function validateChangePasswordBody(body: unknown): ChangePasswordBody {
  return ChangePasswordBodyValidationSchema.validateSync(body, {
    abortEarly: false,
  });
}
