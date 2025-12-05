import { logger } from '#config/logger.js';
import { ApiError } from '#utils/apiError.js';
import { Response, Request } from 'express';

export default function globalErrorHandler(
  err: ApiError,
  req: Request,
  res: Response
) {
  err.statusCode ||= 500;
  err.status ||= 'error';

  logger.error(err.message);

  // Development environment → return full details
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      ...err,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production environment → hide internal message
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.isOperational ? err.message : 'Something went wrong',
  });
}
