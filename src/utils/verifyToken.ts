import { jwtVerify } from 'jose';
import { env } from '../config/env';
import { ApiError } from './apiError';
import { status } from 'http-status';

export async function verifyToken<T>(
  token: string,
  errorMessage = 'Invalid Token'
) {
  try {
    const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as T;
  } catch {
    throw new ApiError(status.BAD_REQUEST, errorMessage);
  }
}
