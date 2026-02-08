/**
 * @file index.model.ts
 * @fileoverview This file contains the index model
 */

import { sequelize } from "../config/db.config.js";
import { UserModel } from "./user.model.js";
import { RefreshTokenModel } from "./refreshToken.model.js";
import { PasswordResetModel } from "./passwordReset.model.js";

/**
 * @constant models
 * @description This constant contains the list of all models
 */
export const models = {
  UserModel,
  RefreshTokenModel,
  PasswordResetModel,
};

// associations
UserModel.hasMany(RefreshTokenModel, { foreignKey: "user_id" });
RefreshTokenModel.belongsTo(UserModel, { foreignKey: "user_id" });

UserModel.hasMany(PasswordResetModel, { foreignKey: "user_id" });
PasswordResetModel.belongsTo(UserModel, { foreignKey: "user_id" });

export { sequelize };
