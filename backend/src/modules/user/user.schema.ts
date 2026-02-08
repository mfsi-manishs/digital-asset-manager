/**
 * @file user.schema.ts
 * @fileoverview This file contains the user schema
 */

import { z } from "zod";
import { emailSchema, nameSchema, userSchema } from "../../schema/base.schema.js";

/**
 * @constant userByIdReqParamsSchema
 * @description Get user by id request params schema
 */
export const userByIdReqParamsSchema = z.object({ id: z.coerce.number().min(1) });
export type UserByIdReqParams = z.infer<typeof userByIdReqParamsSchema>;

export const UserResSchema = userSchema;
export type UserResDTO = z.infer<typeof UserResSchema>;

/**
 * @constant userByEmailReqQParamsSchema
 * @description User's email request query params schema
 */
export const userEmailReqQParamsSchema = z.object({ email: emailSchema });

export type UserEmailReqQParams = z.infer<typeof userEmailReqQParamsSchema>;

/**
 * @constant updateUserReqBodySchema
 * @description Update user request body schema
 */
export const updateUserReqBodySchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
});

export type UpdateUserReqBody = z.infer<typeof updateUserReqBodySchema>;
