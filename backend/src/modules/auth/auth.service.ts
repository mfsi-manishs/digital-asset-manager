/**
 * @file auth.service.ts
 * @fileoverview This file contains the auth service
 */

import bcrypt from "bcrypt";
import { env } from "../../env.js";
import { models } from "../../models/index.model.js";
import { UserModel } from "../../models/user.model.js";
import { sendMail } from "../../services/mail.service.js";
import { generateRandomToken, hashToken } from "../../utils/crypto.utils.js";
import { ConflictError, UnauthorizedError } from "../../utils/error.utils.js";
import { getSignedAccessToken } from "../../utils/jwt.utils.js";
import type { LoginReqBody, RefreshTokenInput, RegisterReqBody } from "./auth.schema.js";

/**
 * @class AuthService
 * @classdesc This class contains the auth service
 */
export class AuthService {
  public static readonly EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  public static readonly SALT_ROUNDS = 12;
  public static readonly MAX_LOGIN_ATTEMPTS = 3;
  public static readonly LOCK_DURATION = 10 * 60 * 1000; // 10 minutes
  public static readonly RESET_EXPIRY = 60 * 60 * 1000; // 1 hour

  /**
   * Registers a new user
   * @param {RegisterReqBody} input - Input containing name, email and password
   * @throws {ConflictError} If email is already registered
   * @returns {Promise<UserModel>} A promise containing the newly created user
   * @description This function registers a new user and returns the newly created user
   */
  static async register(input: RegisterReqBody): Promise<UserModel> {
    const existingEmail = await models.UserModel.findOne({ where: { email: input.email } });
    if (existingEmail) {
      throw new ConflictError("Email is already registered");
    }
    const passwordHash = await bcrypt.hash(input.password, AuthService.SALT_ROUNDS);

    return models.UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });
  }

  /**
   * Logs in an existing user
   * @param {LoginReqBody} input - Input containing email, password, userAgent, and ipAddress
   * @throws {UnauthorizedError} If email or password is invalid, or if account is locked
   * @returns {Promise<{accessToken: string, refreshToken: string, user: UserModel}>} A promise containing the access token, refresh token, and user
   * @description This function logs in an existing user and returns an access token and a refresh token
   */
  static async login({ email, password, userAgent, ipAddress }: LoginReqBody) {
    const user = await models.UserModel.findOne({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    // Check if account is locked
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      const ms = user.lockUntil.getTime() - Date.now();
      throw new UnauthorizedError(`Account is locked. Try again later after ${Math.ceil(ms / 1000 / 60)} minutes.`);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      // Failed login: increment attempts
      if (user.loginAttempts === undefined) user.loginAttempts = 0;
      user.loginAttempts += 1;
      if (user.loginAttempts >= AuthService.MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + AuthService.LOCK_DURATION);
      }

      await user.save();
      throw new UnauthorizedError("Invalid credentials");
    }

    await user.update({
      lastLoginAt: new Date(),
      loginAttempts: 0,
      lockUntil: null,
    });

    await user.reload(); // refresh from DB

    const userRole = user.role;
    if (!userRole) throw new UnauthorizedError("Unauthorized user role");

    // Issue tokens
    const accessToken = await getSignedAccessToken({ sub: user.id.toString(), role: userRole });
    const refreshToken = generateRandomToken();

    await models.RefreshTokenModel.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + AuthService.EXPIRY),
      userAgent,
      ipAddress,
    });

    return { accessToken, refreshToken, user };
  }

  /**
   * Refreshes an access token with a new one
   * @param {RefreshTokenInput} input - Refresh token input
   * @throws {UnauthorizedError} If refresh token is invalid
   * @returns {Promise<{accessToken: string, refreshToken: string, user: UserModel}>} A promise containing the new access token, refresh token, and user
   * @description This function refreshes an access token with a new one and returns the new access token and refresh token
   */
  static async refreshToken({ refreshToken, userAgent, ipAddress }: RefreshTokenInput) {
    const oldHash = hashToken(refreshToken);
    const existing = await models.RefreshTokenModel.findOne({ where: { tokenHash: oldHash } });
    if (!existing) throw new UnauthorizedError("Invalid refresh token");

    // Invalidate old token
    await models.RefreshTokenModel.destroy({ where: { tokenHash: oldHash } });

    // Issue new access + refresh token
    const user = await models.UserModel.findByPk(existing.userId);
    if (!user) throw new UnauthorizedError("User not found");

    const userRole = user.role;
    if (!userRole) throw new UnauthorizedError("Unauthorized user role");

    const accessToken = await getSignedAccessToken({ sub: user.id.toString(), role: userRole });
    const newRefreshToken = generateRandomToken();

    await models.RefreshTokenModel.create({
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + AuthService.EXPIRY),
      userAgent,
      ipAddress,
    });

    return { accessToken, refreshToken: newRefreshToken, user };
  }

  /**
   * Sends a password reset email to the user with the given email address
   * @param {string} email - Email address of the user to send the password reset email to
   * @returns {Promise<void>} A promise that resolves when the password reset email is sent
   * @description This function sends a password reset email to the user with the given email address
   */
  static async forgotPassword(email: string) {
    const user = await models.UserModel.findOne({ where: { email } });
    if (!user) return; // don't reveal existence

    const resetToken = generateRandomToken();
    await models.PasswordResetModel.create({
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: new Date(Date.now() + AuthService.RESET_EXPIRY),
    });

    const resetLink = `${env.frontendUrl}/reset-password?token=${resetToken}`;
    await sendMail(user.email, "Reset your password", `Click here: ${resetLink}`);
  }

  /**
   * Resets the password of the user with the given reset token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>} A promise that resolves when the password is reset
   * @description This function resets the password of the user with the given reset token
   * It takes a reset token and a new password and resets the password of the user
   * It throws an UnauthorizedError if the reset token is invalid or expired
   * It throws an UnauthorizedError if the user is not found
   */
  static async resetPassword(token: string, newPassword: string) {
    const resetEntry = await models.PasswordResetModel.findOne({ where: { tokenHash: hashToken(token) } });
    if (!resetEntry || resetEntry.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    const user = await models.UserModel.findByPk(resetEntry.userId);
    if (!user) throw new UnauthorizedError("User not found");

    user.passwordHash = await bcrypt.hash(newPassword, AuthService.SALT_ROUNDS);
    await user.save();

    await models.PasswordResetModel.destroy({ where: { id: resetEntry.id } });
  }

  /**
   * Logs out an existing user
   * @param {string} refreshToken - Refresh token to delete
   * @throws {UnauthorizedError} If refresh token is invalid
   * @description This function logs out an existing user by deleting the refresh token
   */
  static async logout(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError("Invalid refresh token");

    const hashedRefreshToken = hashToken(refreshToken);
    const existingToken = await models.RefreshTokenModel.findOne({ where: { tokenHash: hashedRefreshToken } });
    if (!existingToken) throw new UnauthorizedError("Invalid refresh token");

    await models.RefreshTokenModel.destroy({ where: { tokenHash: hashedRefreshToken } });
  }
}
