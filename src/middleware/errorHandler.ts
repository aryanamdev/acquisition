import { logger } from '#config/logger.js';
import { ApiError } from '#utils/apiError.js';
import { Response, Request, NextFunction } from 'express';

export default function globalErrorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  err.statusCode ||= 500;
  err.status ||= 'error';

  logger.error(err.message);

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      status: err.status,
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode).json({
    statusCode: err.statusCode,
    status: err.status,
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong',
  });
}
