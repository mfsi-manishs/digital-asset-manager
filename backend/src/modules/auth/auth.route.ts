/**
 * @file auth.route.ts
 * @fileoverview This file contains the auth routes
 */

import { Router } from "express";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { AuthController } from "./auth.controller.js";
import {
  forgotPasswordReqBodySchema,
  loginReqBodySchema,
  refreshTokenSchema,
  registerReqBodySchema,
  resetPasswordReqBodySchema,
} from "./auth.schema.js";

/**
 * Registers a new user and logs in an existing user
 * @returns {Router} Express router with auth routes
 */
export default function authRoutes() {
  const router = Router();

  /**
   * @openapi
   * /api/auth/register:
   *   post:
   *     summary: Register a new user. The email must not be already registered.
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterReqBody'
   *     responses:
   *       201:
   *         description: User created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RegisterResDTO'
   */
  router.post("/register", validateRequest({ body: registerReqBodySchema }), AuthController.register);

  /**
   * @openapi
   * /api/auth/login:
   *   post:
   *     summary: Login a user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginReqBody'
   *     responses:
   *       200:
   *         description: Successfully logged in
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResDTO'
   */
  router.post("/login", validateRequest({ body: loginReqBodySchema }), AuthController.login);

  /**
   * @openapi
   * /api/auth/refresh-token:
   *   post:
   *     summary: Refresh access token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Tokens refreshed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RefreshTokenResDTO'
   */
  router.post("/refresh-token", validateRequest({ cookies: refreshTokenSchema }), AuthController.refreshToken);

  /**
   * @openapi
   * /api/auth/forgot-password:
   *   post:
   *     summary: Request password reset
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgotPasswordReqBody'
   *     responses:
   *       200:
   *         description: Password reset link sent to your registered email.
   */
  router.post(
    "/forgot-password",
    validateRequest({ body: forgotPasswordReqBodySchema }),
    AuthController.forgotPassword
  );

  /**
   * @openapi
   * /api/auth/reset-password:
   *   post:
   *     summary: Reset password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ResetPasswordReqBody'
   *     responses:
   *       200:
   *         description: Password reset successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ResetPasswordResDTO'
   * */
  router.post("/reset-password", validateRequest({ body: resetPasswordReqBodySchema }), AuthController.resetPassword);

  /**
   * @openapi
   * /api/auth/logout:
   *   post:
   *     summary: Logout a user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Successfully logged out
   */
  router.post("/logout", AuthController.logout);

  return router;
}
