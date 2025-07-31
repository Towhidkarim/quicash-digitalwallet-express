import { Request, Response } from 'express';
import { status as status_code } from 'http-status';

export async function notFound(req: Request, res: Response) {
  res.status(status_code.NOT_FOUND).json({
    success: false,
    message: 'Route Not Found',
    data: null,
  });
}
