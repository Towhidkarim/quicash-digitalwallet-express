import { ZodType } from 'zod';
import { ApiError } from './apiError';
import { status } from 'http-status';
import { ZodError } from 'zod/v3';

export function validateSchema<T>(schema: ZodType<T, any>, body: unknown): T {
  try {
    return schema.parse(body); // use `parse` to throw immediately
  } catch (err) {
    if (err instanceof ZodError) {
      // Format the Zod error into a readable and structured response
      const formattedErrors = err.errors.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      throw new ApiError(
        status.BAD_REQUEST,
        'Validation failed',
        formattedErrors
      );
    }

    // Re-throw unknown errors
    throw err;
  }
}
