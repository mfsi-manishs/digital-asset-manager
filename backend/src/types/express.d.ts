/**
 * @file express.d.ts
 * @fileoverview This file contains the express types
 */

import { AuthenticatedUser } from "../modules/auth/auth.types.js";

declare global {
  namespace Express {
    /**
     * @interface Request
     * @description Express request
     */
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
