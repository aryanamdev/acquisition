import jsonwebtoken from 'jsonwebtoken';
import { logger } from '#config/logger.js';
import { ApiError } from '#utils/apiError.js';
import type { StringValue } from 'ms';

const JWT_BASE_SECRET = process.env.JWT_SECRET || '';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || JWT_BASE_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || JWT_BASE_SECRET;
const EMAIL_VERIFICATION_SECRET = process.env.JWT_SECRET || JWT_BASE_SECRET;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const EMAIL_VERIFICATION_EXPIRY = process.env.EMAIL_VERIFICATION_EXPIRY || '1d';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export type JwtPayload = {
  id: string;
  role: UserRole;
};

export type EmailVerificationPayload = {
  id: string;
  email: string;
};

const signToken = (
  payload: object,
  secret: string,
  expiresIn: StringValue
): string => {
  try {
    return jsonwebtoken.sign(payload, secret, { expiresIn });
  } catch (error) {
    logger.error('Failed to sign token', error);
    throw new ApiError(500, 'Failed to sign token');
  }
};

const verifyToken = <T>(token: string, secret: string): T => {
  try {
    const decoded = jsonwebtoken.verify(token, secret);
    if (typeof decoded === 'string') {
      throw new ApiError(401, 'Unauthorized');
    }
    return decoded as T;
  } catch (error) {
    logger.error('Unauthorized', error);
    throw new ApiError(401, 'Unauthorized');
  }
};

const jwt = {
  signAccessToken: (payload: JwtPayload): string =>
    signToken(payload, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY as StringValue),

  signRefreshToken: (payload: JwtPayload): string =>
    signToken(
      payload,
      REFRESH_TOKEN_SECRET,
      REFRESH_TOKEN_EXPIRY as StringValue
    ),

  signEmailVerificationToken: (payload: EmailVerificationPayload): string => {
    return signToken(
      payload,
      EMAIL_VERIFICATION_SECRET,
      EMAIL_VERIFICATION_EXPIRY as StringValue
    );
  },

  verifyAccessToken: (token: string): JwtPayload =>
    verifyToken<JwtPayload>(token, ACCESS_TOKEN_SECRET),

  verifyRefreshToken: (token: string): JwtPayload =>
    verifyToken<JwtPayload>(token, REFRESH_TOKEN_SECRET),

  verifyEmailVerificationToken: (token: string): EmailVerificationPayload =>
    verifyToken<EmailVerificationPayload>(token, EMAIL_VERIFICATION_SECRET),
};

export default jwt;
