import { ZodType } from 'zod';
import { ApiError } from './apiError';
import { status } from 'http-status';

export function validateSchema<T>(schema: ZodType<T, any>, body: unknown): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ApiError(status.BAD_REQUEST, result.error.message);
  }

  return result.data;
}
