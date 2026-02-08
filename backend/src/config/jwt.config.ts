/**
 * @file JWT configuration
 * @fileoverview This file contains the configuration for JWT
 */

import { env } from "../env.js";

/**
 * @constant jwtConfig
 * @description JWT configuration
 */
export const jwtConfig = {
  accessToken: {
    algorithm: "HS256" as const,
    expiresIn: "15m",
    issuer: "my-api",
    audience: "my-client",
    secret: new TextEncoder().encode(env.jwtAccessSecret),
  },
};
