import * as Yup from "yup";

type AuthBody = {
  email: string;
  password: string;
};

export const AuthBodyValidationSchema = Yup.object()
  .shape<AuthBody>({
    email: Yup.string().required("Email mandatory"),
    password: Yup.string().required("Password mandatory"),
  })
  .required();

export function validateAuthBody(body: unknown): AuthBody {
  return AuthBodyValidationSchema.validateSync(body, {
    abortEarly: false,
  });
}

type RegisterBody = {
  email: string;
  password: string;
  name: string;
};

export const RegisterBodyValidationSchema = Yup.object()
  .shape<RegisterBody>({
    email: Yup.string().required("Email mandatory"),
    password: Yup.string().required("Password mandatory"),
    name: Yup.string().required("Name mandatory"),
  })
  .required();

export function validateRegisterBody(body: unknown): RegisterBody {
  return RegisterBodyValidationSchema.validateSync(body, {
    abortEarly: false,
  });
}
