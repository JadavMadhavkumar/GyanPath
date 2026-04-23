import { Request, Response, NextFunction } from 'express';
import { errorResponse, serverErrorResponse } from '../utils/response';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 400, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(err: Error | ApiError, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return errorResponse(res, err.message, err.statusCode, err.code, err.details);
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  return serverErrorResponse(res, 'An unexpected error occurred');
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
