import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { errorResponse } from '../utils/response';
import { getRedis } from '../lib/redis';

/**
 * Global rate limiter
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMITED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * User-specific rate limiter (per user ID)
 */
export function createUserRateLimiter(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 50
) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req: Request) => req.userId || req.ip || 'anonymous',
    message: {
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMITED',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Strict rate limiter for auth endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later',
      code: 'RATE_LIMITED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI analysis rate limiter (per user, per day)
 */
export async function aiAnalysisRateLimiter(req: Request, res: Response, next: NextFunction) {
  try {
    const redis = getRedis();
    const userId = req.userId;

    if (!userId) {
      return errorResponse(res, 'Authentication required', 401, 'AUTH_REQUIRED');
    }

    const key = `ai_limit:${userId}:${new Date().toISOString().split('T')[0]}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 86400); // 24 hours
    }

    if (count > 5) {
      return errorResponse(res, 'AI analysis limit reached. Try again tomorrow', 429, 'RATE_LIMITED');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Question submission rate limiter
 */
export const questionSubmissionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10,
  message: {
    success: false,
    error: {
      message: 'Daily question submission limit reached',
      code: 'RATE_LIMITED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
