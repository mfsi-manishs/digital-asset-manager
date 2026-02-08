/**
 * @file auth.controller.ts
 * @fileoverview This file contains the auth controller
 */

import type { Request, Response } from "express";
import { env } from "../../env.js";
import {
  toForgotPasswordResDTO,
  toLoginResDTO,
  toLogoutResDTO,
  toRefreshTokenResponseDTO,
  toRegisterResDTO,
  toResetPasswordResDTO,
} from "./auth.mapper.js";
import type { ForgotPasswordReqBody, LoginReqBody, RegisterReqBody, ResetPasswordReqBody } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";

/**
 * @class AuthController
 * @classdesc This class contains the auth controller
 */
export class AuthController {
  /**
   * Registers a new user
   * @param {Request<object, object, RegisterReqBody>} req - Express request object
   * @param {Response} res - Express response object
   * @throws {UnauthorizedError} If email or password is invalid
   * @returns {Promise<Response>} A promise containing the response object
   * @description This function registers a new user and returns a response containing the newly created user
   */
  static async register(req: Request<object, object, RegisterReqBody>, res: Response) {
    const user = await AuthService.register(req.body);
    res.status(201).json(toRegisterResDTO(user));
  }

  /**
   * Logs in an existing user
   * @param {Request<object, object, LoginReqBody>} req - Express request object
   * @param {Response} res - Express response object
   * @throws {UnauthorizedError} If email or password is invalid
   * @description This function logs in an existing user and returns an access token and a refresh token
   */
  static async login(req: Request<object, object, LoginReqBody>, res: Response) {
    const ua = req.headers["user-agent"] as string;
    const ip = req.ip as string;
    const { accessToken, refreshToken, user } = await AuthService.login({ ...req.body, userAgent: ua, ipAddress: ip });
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: "strict",
      })
      .json(toLoginResDTO(user, accessToken));
  }

  /**
   * Refreshes an access token
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @throws {UnauthorizedError} If refresh token is invalid
   * @description This function refreshes an access token and returns a new access token and a refresh token
   */
  static async refreshToken(req: Request, res: Response) {
    const ua = req.headers["user-agent"] as string;
    const ip = req.ip as string;
    const { accessToken, refreshToken, user } = await AuthService.refreshToken({
      refreshToken: req.cookies.refreshToken,
      userAgent: ua,
      ipAddress: ip,
    });
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: "strict",
      })
      .json(toRefreshTokenResponseDTO(user, accessToken));
  }

  /**
   * Sends a password reset link to the user's registered email
   * @param {Request<object, object, ForgotPasswordReqBody>} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} A promise containing the response object
   * @description This function sends a password reset link to the user's registered email
   */
  static async forgotPassword(req: Request<object, object, ForgotPasswordReqBody>, res: Response) {
    await AuthService.forgotPassword(req.body.email);
    return res.status(200).json(toForgotPasswordResDTO("Password reset link sent to your registered email."));
  }

  /**
   * Resets a user's password
   * @param {Request<object, object, ResetPasswordReqBody>} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} A promise containing the response object
   * @description This function resets a user's password
   */
  static async resetPassword(req: Request<object, object, ResetPasswordReqBody>, res: Response) {
    await AuthService.resetPassword(req.body.token, req.body.newPassword);
    return res.status(200).json(toResetPasswordResDTO("Password reset successful"));
  }

  /**
   * Logs out the user by clearing the refresh token cookie
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} A promise containing the response object
   * @description This function logs out the user by clearing the refresh token cookie
   */
  static async logout(req: Request, res: Response) {
    await AuthService.logout(req.cookies.refreshToken);
    res.clearCookie("refreshToken").status(200).json(toLogoutResDTO("Successfully logged out"));
  }
}
