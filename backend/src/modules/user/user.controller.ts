/**
 * @file user.controller.ts
 * @fileoverview This file contains the user controller
 */

import type { Request, Response } from "express";
import { toUserResDTO, toUsersResDTO } from "./user.mapper.js";
import { type UserByIdReqParams, type UserEmailReqQParams } from "./user.schema.js";
import { UserService } from "./user.service.js";

export class UserController {
  /**
   * Retrieves all users from the database
   * @returns {Promise<Response>} A promise containing the response object
   * @throws {Error} If there is an error retrieving the users
   */
  static async getAllUsers(_req: Request, res: Response) {
    const users = await UserService.getAllUsers();
    res.status(200).json(toUsersResDTO(users));
  }

  /**
   * Retrieves a user by ID from the database
   * @param {Request<UserByIdReqParams>} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} A promise containing the response object
   * @throws {NotFoundError} If the user is not found
   */
  static async getUserById(req: Request, res: Response) {
    const user = await UserService.getUserById(req.params as unknown as UserByIdReqParams); // casted as unknown
    res.status(200).json(toUserResDTO(user));
  }

  /**
   * Retrieves a user by email from the database
   * @param {Request<UserEmailReqQParams>} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} A promise containing the response object
   * @throws {NotFound} If the user is not found
   * @description This function retrieves a user by email from the database
   */
  static async getUserByEmail(req: Request<object, object, object, UserEmailReqQParams>, res: Response) {
    const user = await UserService.getUserByEmail(req.query);
    res.status(200).json(toUserResDTO(user));
  }

  /**
   * Updates a user by ID in the database
   * @param {Request<UserByIdReqParams, object, UpdateUserReqBody>} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<Response>} A promise containing the response object
   * @description This function updates a user by ID in the database
   */
  static async updateUserById(req: Request, res: Response) {
    const user = await UserService.updateUserById(req.params as unknown as UserByIdReqParams, req.body);
    res.status(200).json(toUserResDTO(user));
  }
}
