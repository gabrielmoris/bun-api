const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-change-me');
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { User } from '../types/userTypes';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const ISSUER = 'bookmarks-app';
const ACCESS_AUDIENCE = 'bookmarks-api';
const REFRESH_AUDIENCE = 'bookmarks-refresh';

async function createAccessToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    sub: String(user.id),
    id: user.id,
    name: user.name,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(ACCESS_AUDIENCE)
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);

  return token;
}

async function createRefreshToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    sub: String(user.id),
    type: 'refresh',
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(REFRESH_AUDIENCE)
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secret);
}

async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, secret, {
    issuer: ISSUER,
    audience: REFRESH_AUDIENCE,
  });

  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  return payload;
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret, {
    issuer: ISSUER,
    audience: ACCESS_AUDIENCE,
  });

  return payload;
}

export async function refreshAccessToken(
  refreshToken: string,
  getUserById: (id: number) => Promise<User | null>
) {
  const payload = await verifyRefreshToken(refreshToken);
  const userId = Number(payload.sub);

  if (!Number.isInteger(userId)) {
    throw new Error('Invalid token subject');
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const accessToken = await createAccessToken(user);

  return { accessToken };
}

export async function createAuthTokens(user: User) {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(user),
    createRefreshToken(user),
  ]);

  return { accessToken, refreshToken };
}
