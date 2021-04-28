import { Errors } from "@agado/model";

interface ApiErrorOpts {
  statusCode?: number;
  message?: string;
}

export class ApiError extends Error {
  statusCode: number;
  details: unknown;
  apiErrorCode: Errors.ApiErrorCode;

  constructor(
    apiErrorCode: Errors.ApiErrorCode,
    error: string | Error,
    options: ApiErrorOpts = {}
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    super(errorMessage);
    const { statusCode = 500, message } = options;

    this.apiErrorCode = apiErrorCode;
    this.message = message || "An error occured";
    this.details = errorMessage;
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(apiErrorCode: Errors.ApiErrorCode, error?: string | Error) {
    const errorMessage = error instanceof Error ? error.message : error;

    super(apiErrorCode, errorMessage || "unauthorized", { statusCode: 403 });
  }
}

export class UnAuthenticatedError extends ApiError {
  constructor(error?: string | Error) {
    const errorMessage = error instanceof Error ? error.message : error;

    super(
      Errors.ApiErrorCode.AUTHENT_UNAUTHENTICATED,
      errorMessage || "unauthenticated",
      {
        statusCode: 401,
      }
    );
  }
}
