interface ApiErrorOpts {
  statusCode?: number;
  message?: string;
}

export class ApiError extends Error {
  statusCode: number;
  details: unknown;

  constructor(initialError: Error, options: ApiErrorOpts = {}) {
    super(initialError.message);
    const { statusCode = 500, message } = options;

    this.message = message || "An error occured";
    this.details = initialError.message;
    this.statusCode = statusCode;
  }
}
