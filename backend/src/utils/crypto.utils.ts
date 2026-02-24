/**
 * @file crypto.utils.ts
 * @fileoverview This file contains the crypto utils
 */

import crypto from "crypto";

/**
 * Hash token
 */
export const hashToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");

/**
 * Generate random token
 * @returns Random token
 */
export const generateRandomToken = (): string => crypto.randomBytes(64).toString("hex");

/**
 * Hash api key
 * @param apiKey
 * @returns
 */
export const hashApiKey = (apiKey: string): string => hashToken(apiKey);

/**
 * Generate api key
 * @returns 32 character api key
 */
export const generateApiKey = (): string => crypto.randomBytes(32).toString("hex");
