import jsonwebtoken from 'jsonwebtoken';
import { logger } from '#config/logger.js';
import { ApiError } from './apiError.js';

const JWT_SECRET = process.env.TOKEN_SECRET || '';
const JWT_EXPIRY = '1d';

enum UserRole {
    USER = 'user',
    Admin = 'admin'
}

export type jwtPayload = {
  id: string;
  role: UserRole;
};

const jwt = {
  sign: (payload: jwtPayload) => {
    try {
      return jsonwebtoken.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    } catch (error) {
      logger.error('Failed to authenticate token', error);
      throw new ApiError(500, 'Failed to authenticate token');
    }
  },
  verify: (token: string) => {
    try {
      return jsonwebtoken.verify(token, JWT_SECRET, { complete: true });
    } catch (error) {
      logger.error('Unauthorized', error);
      throw new ApiError(401, 'Unauthorized');
    }
  },
};

export default jwt;
