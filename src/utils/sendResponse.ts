import { Response } from 'express';

export function sendResponse<T = any>(
  res: Response,
  {
    statusCode,
    message,
    data,
  }: { statusCode: number; message: string; data: T }
) {
  res.status(statusCode).json({
    message,
    statusCode,
    data,
  });
}
