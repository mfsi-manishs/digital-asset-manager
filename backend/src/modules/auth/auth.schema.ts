/**
 * @file Auth schema
 * @fileoverview This file contains the auth schema
 */

import { z } from "zod";
import { emailSchema, messageSchema, passwordSchema, userSchema } from "../../schema/base.schema.js";

export const tokenSchema = z.string().trim().min(1, "Refresh Token is required");

/**
 * @constant registerReqBodySchema
 * @description Register request body schema
 */
export const registerReqBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required and can not be too short")
      .max(64, "Name is required and can not be too long")
      .regex(
        /^[\p{L}\p{M}]+([ '.\-][\p{L}\p{M}]+)*$/u,
        "Name can only contain unicode letters, spaces, dots, hyphens and apostrophes"
      ),
    email: emailSchema,
    password: passwordSchema,
  })
  .openapi("registerReqBodySchema");
export type RegisterReqBody = z.infer<typeof registerReqBodySchema>;

/**
 * @constant registerResSchema
 * @description Register response schema
 */
export const registerResSchema = userSchema;
export type RegisterResDTO = z.infer<typeof registerResSchema>;

/**
 * @constant loginReqBodySchema
 * @description Login request body schema
 */
export const loginReqBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginReqBody = z.infer<typeof loginReqBodySchema> & { userAgent: string; ipAddress: string };

/**
 * @constant loginResSchema
 * @description Login response schema
 */
export const loginResSchema = userSchema.extend({
  token: z.string(),
  lastLoginAt: z.date().nullable(),
  loginAttempts: z.number().default(0),
  lockUntil: z.date().nullable(),
});
export type LoginResDTO = z.infer<typeof loginResSchema>;

/**
 * @constant refreshTokenSchema
 * @description Refresh token schema
 */
export const refreshTokenSchema = z.object({ refreshToken: tokenSchema });
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema> & { userAgent: string; ipAddress: string };

/**
 * @constant refreshTokenResSchema
 * @description Refresh token response schema
 */
export const refreshTokenResSchema = loginResSchema;
export type RefreshTokenResDTO = z.infer<typeof refreshTokenResSchema>;

/**
 * @constant forgotPasswordReqBodySchema
 * @description Forgot password request body schema
 */
export const forgotPasswordReqBodySchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordReqBody = z.infer<typeof forgotPasswordReqBodySchema>;

/**
 * @constant forgotPasswordResSchema
 * @description Forgot password response schema
 */
export const forgotPasswordResSchema = z.object({ message: messageSchema });
export type ForgotPasswordResDTO = z.infer<typeof forgotPasswordResSchema>;

/**
 * @constant resetPasswordReqBodySchema
 * @description Reset password request body schema
 */
export const resetPasswordReqBodySchema = z.object({
  token: tokenSchema,
  newPassword: passwordSchema,
});
export type ResetPasswordReqBody = z.infer<typeof resetPasswordReqBodySchema>;

/**
 * @constant resetPasswordResSchema
 * @description Reset password response schema
 */
export const resetPasswordResSchema = z.object({ message: messageSchema });
export type ResetPasswordResDTO = z.infer<typeof resetPasswordResSchema>;

/**
 * @constant logoutResSchema
 * @description Logout response schema
 */
export const logoutResSchema = z.object({ message: messageSchema });
export type LogoutResDTO = z.infer<typeof logoutResSchema>;
