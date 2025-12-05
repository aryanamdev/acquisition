export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  isOperational: boolean;
  status: string;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // identifies trusted errors
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}
