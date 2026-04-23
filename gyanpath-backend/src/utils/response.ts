import { Response } from 'express';

/**
 * Standard API response helper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export function successResponse<T>(res: Response, data: T, meta?: ApiResponse['meta']): Response {
  return res.status(200).json({
    success: true,
    data,
    meta,
  });
}

export function createdResponse<T>(res: Response, data: T): Response {
  return res.status(201).json({
    success: true,
    data,
  });
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode: number = 400,
  code?: string,
  details?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      details,
    },
  });
}

export function notFoundResponse(res: Response, message: string = 'Resource not found'): Response {
  return errorResponse(res, message, 404, 'NOT_FOUND');
}

export function unauthorizedResponse(
  res: Response,
  message: string = 'Unauthorized'
): Response {
  return errorResponse(res, message, 401, 'AUTH_REQUIRED');
}

export function forbiddenResponse(
  res: Response,
  message: string = 'Forbidden'
): Response {
  return errorResponse(res, message, 403, 'FORBIDDEN');
}

export function serverErrorResponse(
  res: Response,
  message: string = 'Internal server error'
): Response {
  return errorResponse(res, message, 500, 'SERVER_ERROR');
}
