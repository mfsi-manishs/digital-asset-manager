/**
 * @file auth.mapper.ts
 * @fileoverview This file contains the auth mapper
 */

import type { UserModel } from "../../models/user.model.js";
import type {
  ForgotPasswordResDTO,
  LoginResDTO,
  LogoutResDTO,
  RefreshTokenResDTO,
  RegisterResDTO,
  ResetPasswordResDTO,
} from "./auth.schema.js";

/**
 * Maps a user to a register response
 * @param {UserModel} user - User to map
 * @returns {RegisterResDTO} Mapped user
 */
export const toRegisterResDTO = (user: UserModel): RegisterResDTO => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role!, // shall not be null as db ensures it.
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * Maps a user to a login response
 * @param {UserModel} user - User to map
 * @param {string} token - Access token
 * @returns {LoginResDTO} Mapped user
 * @description This function maps a user to a login response
 * It takes a user and an access token and returns a login response
 * The login response contains the user's id, name, email, role, token, isEmailVerified, lastLoginAt, loginAttempts, lockUntil, createdAt, and updatedAt
 */
export const toLoginResDTO = (user: UserModel, token: string): LoginResDTO => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role!, // shall not be null as db ensures it.
  token,
  lastLoginAt: user.lastLoginAt!, // shall not be null as db ensures it.
  loginAttempts: user.loginAttempts!, // shall not be null as db ensures it.
  lockUntil: user.lockUntil!, // shall not be null as db ensures it.
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * Maps an access token to a refresh token response
 * @param {string} token - Access token to map
 * @returns {RefreshTokenResDTO} Mapped access token
 */
export const toRefreshTokenResponseDTO = (user: UserModel, token: string): RefreshTokenResDTO =>
  toLoginResDTO(user, token);

/**
 * Maps a message to a forgot password response
 * @param {string} message - Message to map
 * @returns {ForgotPasswordResDTO} Mapped message
 */
export const toForgotPasswordResDTO = (message: string): ForgotPasswordResDTO => ({ message });

/**
 * Maps a message to a reset password response
 * @param {string} message - Message to map
 * @returns {ResetPasswordResDTO} Mapped message
 */
export const toResetPasswordResDTO = (message: string): ResetPasswordResDTO => ({ message });

export const toLogoutResDTO = (message: string): LogoutResDTO => ({ message });
