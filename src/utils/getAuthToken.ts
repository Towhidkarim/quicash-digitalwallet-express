import { Request } from 'express';

export function getAuthToken(req: Request): string | undefined {
  const auth = req.headers.authorization;
  return typeof auth === 'string' ? auth.split(' ')[1] : undefined;
}
