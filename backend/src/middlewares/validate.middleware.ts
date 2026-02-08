/**
 * @file validate.middleware.ts
 * @fileoverview This file contains the zod validation middleware
 */

import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

/**
 * @interface RequestSchemas
 * @description Object containing Zod schemas for body, query, params and cookies
 */
interface RequestSchemas {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  cookies?: z.ZodTypeAny;
}

/**
 * Validates the request body, query, params and cookies using Zod schemas.
 * If any of the validations fail, an HTTP 400 status code will be returned.
 * @param {RequestSchemas} schemas - Object containing Zod schemas for body, query, params and cookies
 * @returns {Promise<void>} - A promise that resolves when the validation is successful
 */
export const validateRequest =
  (schemas: RequestSchemas) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) await schemas.params.parseAsync(req.params);
      if (schemas.query) await schemas.query.parseAsync(req.query);
      if (schemas.body) await schemas.body.parseAsync(req.body);
      if (schemas.cookies) await schemas.cookies.parseAsync(req.cookies);
      next();
    } catch (error) {
      next(error);
    }
  };
