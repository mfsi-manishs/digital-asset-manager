/**
 * @file jwt.utils.ts
 * @fileoverview This file contains the jwt utils
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { jwtConfig } from "../config/jwt.config.js";
import type { AccessTokenPayload } from "../modules/auth/auth.types.js";

/**
 * Signs an access token using the given payload
 * @param {AccessTokenPayload} payload - Payload containing sub, role, and other claims
 * @returns {Promise<string>} A promise containing the signed access token
 * @description This function signs an access token using the given payload
 * It takes a payload containing sub, role, and other claims, and returns a promise containing the signed access token
 */
export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: jwtConfig.accessToken.algorithm })
    .setIssuedAt()
    .setIssuer(jwtConfig.accessToken.issuer)
    .setAudience(jwtConfig.accessToken.audience)
    .setExpirationTime(jwtConfig.accessToken.expiresIn)
    .sign(jwtConfig.accessToken.secret);
}

/**
 * Verifies an access token using the given token
 * @param {string} token - Token to verify
 * @returns {Promise<AccessTokenPayload>} A promise containing the verified access token payload
 * @description This function verifies an access token using the given token
 * It takes a token, and returns a promise containing the verified access token payload
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, jwtConfig.accessToken.secret, {
    issuer: jwtConfig.accessToken.issuer,
    audience: jwtConfig.accessToken.audience,
  });

  return payload as AccessTokenPayload;
}
