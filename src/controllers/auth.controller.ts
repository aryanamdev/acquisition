import { logger } from '#config/logger.js';
import { db } from '#config/db.js';
import { users } from '#models/users.model.js';
import jwt, { JwtPayload, UserRole } from '#utils/jwt.js';
import { ApiError } from '#utils/apiError.js';
import { ApiResponse } from '#utils/apiResponse.js';
import { cookies } from '#utils/cookies.js';
import { formatValidationError } from '#utils/formatValidation.js';
import { loginSchema, registerSchema } from '#validations/auth.validations.js';
import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { sendEmailVerification } from '#services/email.service.js';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

const buildUserPayload = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
});

const buildJwtPayload = (user: User): JwtPayload => ({
  id: String(user.id),
  role: (user.role as UserRole) || UserRole.USER,
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, formatValidationError(result.error));
    }

    const { email, name, role, password } = result.data;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning();

    const emailToken = jwt.signEmailVerificationToken({
      id: String(created.id),
      email: created.email,
    });

    await sendEmailVerification(created.email, emailToken);

    logger.info('User registered successfully, verification email sent');

    return res.status(201).json(
      new ApiResponse(
        201,
        'User registered successfully. Please verify your email.',
        {
          user: buildUserPayload(created),
        }
      )
    );
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new ApiError(400, 'Verification token is required');
    }

    const payload = jwt.verifyEmailVerificationToken(token);

    const userId = Number(payload.id);

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.emailVerified) {
      const [updated] = await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      const jwtPayload = buildJwtPayload(updated);
      const accessToken = jwt.signAccessToken(jwtPayload);
      const refreshToken = jwt.signRefreshToken(jwtPayload);

      cookies.set(res, 'refreshToken', refreshToken, {
        path: '/api/v1/auth/refresh-token',
      });

      return res.status(200).json(
        new ApiResponse(200, 'Email verified successfully', {
          user: buildUserPayload(updated),
          tokens: { accessToken },
        })
      );
    }

    const jwtPayload = buildJwtPayload(user);
    const accessToken = jwt.signAccessToken(jwtPayload);
    const refreshToken = jwt.signRefreshToken(jwtPayload);

    cookies.set(res, 'refreshToken', refreshToken, {
      path: '/api/v1/auth/refresh-token',
    });

    return res.status(200).json(
      new ApiResponse(200, 'Email already verified', {
        user: buildUserPayload(user),
        tokens: { accessToken },
      })
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, formatValidationError(result.error));
    }

    const { email, password } = result.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      throw new ApiError(400, 'Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new ApiError(400, 'Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new ApiError(403, 'Please verify your email before logging in');
    }

    const jwtPayload = buildJwtPayload(user);
    const accessToken = jwt.signAccessToken(jwtPayload);
    const refreshToken = jwt.signRefreshToken(jwtPayload);

    cookies.set(res, 'refreshToken', refreshToken, {
      path: '/api/v1/auth/refresh-token',
    });

    return res.status(200).json(
      new ApiResponse(200, 'Logged in successfully', {
        user: buildUserPayload(user),
        tokens: { accessToken },
      })
    );
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenFromCookie = cookies.get(req, 'refreshToken');
    const tokenFromBody = req.body?.refreshToken;

    const refreshToken = tokenFromCookie || tokenFromBody;

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new ApiError(401, 'Refresh token missing');
    }

    const payload = jwt.verifyRefreshToken(refreshToken);
    const userId = Number(payload.id);

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (!user.emailVerified) {
      throw new ApiError(403, 'Please verify your email');
    }

    const jwtPayload = buildJwtPayload(user);
    const accessToken = jwt.signAccessToken(jwtPayload);
    const newRefreshToken = jwt.signRefreshToken(jwtPayload);

    cookies.set(res, 'refreshToken', newRefreshToken, {
      path: '/api/v1/auth/refresh-token',
    });

    return res.status(200).json(
      new ApiResponse(200, 'Token refreshed', {
        tokens: { accessToken },
      })
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    cookies.clear(res, 'refreshToken', {
      path: '/api/v1/auth/refresh-token',
    });

    return res
      .status(200)
      .json(new ApiResponse(200, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};
