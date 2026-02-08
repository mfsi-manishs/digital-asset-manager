/**
 * @file user.mapper.ts
 * @fileoverview This file contains the user mapper
 */

import { UserModel } from "../../models/user.model.js";
import { type UserResDTO } from "./user.schema.js";

/**
 * Maps an array of user objects to an array of user response data transfer objects
 * @param {UserModel[]} users - Array of user objects
 * @returns {UserResDTO[]} - Array of user response data transfer objects
 * @description This function maps an array of user objects to an array of user response data transfer objects
 * It takes an array of user objects and returns an array of user response data transfer objects
 */
export const toUsersResDTO = (users: UserModel[]): UserResDTO[] => {
  return users.map((user) => toUserResDTO(user));
};

/**
 * Maps a user object to a user response data transfer object
 * @param {UserModel} user - User object to map
 * @returns {UserResDTO} - Mapped user response data transfer object
 * @description This function maps a user object to a user response data transfer object
 * It takes a user object and returns a user response data transfer object
 */
export const toUserResDTO = (user: UserModel): UserResDTO => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role!,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
