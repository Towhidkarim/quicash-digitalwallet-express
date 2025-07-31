export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode ?? 500;
    Error.captureStackTrace(this, this.constructor);
  }
}
