/**
 * @file auth.types.ts
 * @fileoverview This file contains the auth types
 */

import type { JWTPayload } from "jose";

import type { UserRole } from "../../models/user.model.js";

/**
 * @interface AccessTokenPayload
 * @description JWT payload for Access token
 */
export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  role: UserRole;
}
