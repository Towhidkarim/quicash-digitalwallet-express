import { JWTPayload, SignJWT } from 'jose';
import { env } from '../config/env';

export async function createToken(
  payload: JWTPayload,
  expiresIn: string
): Promise<string> {
  const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}
