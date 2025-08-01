import { status } from 'http-status';
import { ApiError } from '../utils/apiError';
import { jwtVerify } from 'jose';
import { NextFunction, Request, Response } from 'express';
import { requestUserSchema, TRequestUser } from '../modules/auth/auth.schema';
import z from 'zod';
import { env } from '../config/env';
import { TRoles } from '../config/roles';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    throw new ApiError(status.UNAUTHORIZED, 'Authorization Header Not found');

  const token = authHeader.includes('Bearer')
    ? authHeader.split(' ')[1]
    : authHeader;
  try {
    const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const parsedPayload = requestUserSchema.safeParse(payload);
    if (!parsedPayload.success)
      throw new ApiError(status.UNAUTHORIZED, 'Unauthorized Token');
    req.user = {
      _id: payload._id as string,
      email: payload.email as string,
      role: payload.role as TRoles,
      phoneNumber: payload.phoneNumber as string,
    };
    next();
  } catch (error) {
    console.error(error);
    throw new ApiError(
      status.UNAUTHORIZED,
      'Unauthorized Request or Token Expired'
    );
  }
}
