/**
 * @file base.schema.ts
 * @fileoverview This file contains the base schema
 */

import { z } from "zod";

// Constants
const USER_ROLES = ["user", "admin"] as const;

// Schemas
export const emailSchema = z.email({ message: "Invalid email address" }).transform((val) => val.trim().toLowerCase());
export const passwordSchema = z.string().trim().min(1, "Password is required");
export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name is required and can not be too short")
  .max(64, "Name is required and can not be too long")
  .regex(
    /^[\p{L}\p{M}]+([ '.\-][\p{L}\p{M}]+)*$/u,
    "Name can only contain unicode letters, spaces, dots, hyphens and apostrophes"
  );
export const idSchema = z.number().min(1, "ID is required");
export const messageSchema = z.string().trim().min(2, "Message is required and can not be too short");

export const userSchema = z.object({
  id: idSchema,
  name: nameSchema,
  email: emailSchema,
  role: z.enum(USER_ROLES),
  createdAt: z.date(),
  updatedAt: z.date(),
});
