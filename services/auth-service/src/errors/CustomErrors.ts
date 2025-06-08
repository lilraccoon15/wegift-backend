export class AppError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode = 500, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data?: any) {
    super(message, 400, data);
  }
}

export class AuthError extends AppError {
  constructor(message: string, data?: any) {
    super(message, 401, data);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, data?: any) {
    super(message, 404, data);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, data?: any) {
    super(message, 409, data);
  }
}
