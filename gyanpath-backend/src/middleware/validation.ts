import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response';

/**
 * Validation middleware - validates request body, params, or query against Zod schema
 */
export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];
      const validated = schema.parse(dataToValidate);

      // Replace request data with validated data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return errorResponse(
          res,
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          { errors }
        );
      }

      next(error);
    }
  };
}

/**
 * Validate request body
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body');
}

/**
 * Validate route params
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}
