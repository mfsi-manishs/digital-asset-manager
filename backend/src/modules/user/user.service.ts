/**
 * @file user.service.ts
 * @fileoverview This file contains the user service
 */

import { models } from "../../models/index.model.js";
import { UserModel } from "../../models/user.model.js";
import { NotFoundError } from "../../utils/error.utils.js";
import type { UpdateUserReqBody, UserByIdReqParams, UserEmailReqQParams } from "./user.schema.js";

/**
 * @class UserService
 * @classdesc This class contains the user service
 */
export class UserService {
  /**
   * Gets all users from the database
   * @returns {Promise<UserModel[]>} A promise containing all users
   * @throws {NotFoundError} If no users are found
   */
  static async getAllUsers(): Promise<UserModel[]> {
    const users = await models.UserModel.findAll({});
    if (!users) {
      throw new NotFoundError("No users found");
    }
    return users;
  }

  /**
   * Gets a user by ID from the database
   * @param {UserByIdReqParams} input - Input containing the ID of the user to retrieve
   * @returns {Promise<UserModel>} A promise containing the retrieved user
   * @throws {NotFoundError} If the user is not found
   */
  static async getUserById({ id }: UserByIdReqParams): Promise<UserModel> {
    const user = await models.UserModel.findByPk(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  /**
   * Retrieves a user by email from the database
   * @param {UserEmailReqQParams} input - Input containing the email of the user to retrieve
   * @returns {Promise<UserModel>} A promise containing the retrieved user
   * @throws {NotFoundError} If the user is not found
   * @description This function retrieves a user by email from the database
   */
  static async getUserByEmail({ email }: UserEmailReqQParams): Promise<UserModel> {
    const user = await models.UserModel.findOne({ where: { email: email } });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  /**
   * Updates a user by ID in the database
   * @param {UserByIdReqParams} input - Input containing the ID of the user to update
   * @param {UpdateUserReqBody} data - Data to update the user with
   * @returns {Promise<UserModel>} A promise containing the updated user
   * @throws {NotFoundError} If the user is not found
   * @description This function updates a user by ID in the database
   */
  static async updateUserById({ id }: UserByIdReqParams, data: UpdateUserReqBody): Promise<UserModel> {
    const user = await models.UserModel.findByPk(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await user.update({ name: data.name!, email: data.email! });
    return user.reload(); // refresh from DB
  }
}
