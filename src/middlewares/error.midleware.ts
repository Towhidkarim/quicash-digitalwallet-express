import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errorDetails: any = undefined;

  //Zod validation
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }

  //Mongoose validation
  else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errorDetails = Object.values(err.errors).map((error) => ({
      path: error.path,
      message: error.message,
    }));
  }

  //Mongoose cast error
  else if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Fallback to ApiError
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    statusCode,
    message,
    errorName: err.name,
    ...(errorDetails && { errors: errorDetails }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
