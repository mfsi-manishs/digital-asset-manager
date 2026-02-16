/**
 * @file index.model.ts
 * @fileoverview This file servers as a centralized models registry. It registers the models and export sequelize
 * instance. NOTE: This sequelize instance must be used in other files to access the database.
 */

import { sequelize } from "../packages/shared/db/db.config.js";
import { UserModel } from "./user.model.js";
import { RefreshTokenModel } from "./refreshToken.model.js";
import { PasswordResetModel } from "./passwordReset.model.js";
import { AssetModel } from "./asset.model.js";

/**
 * @constant models
 * @description This constant contains the list of all models
 */
export const models = {
  UserModel,
  RefreshTokenModel,
  PasswordResetModel,
  AssetModel,
};

// associations
UserModel.hasMany(RefreshTokenModel, { foreignKey: "user_id", onDelete: "CASCADE", as: "refreshTokens" });
RefreshTokenModel.belongsTo(UserModel, { foreignKey: "user_id", as: "refreshTokenUser" });

UserModel.hasMany(PasswordResetModel, { foreignKey: "user_id", onDelete: "CASCADE", as: "passwordResets" });
PasswordResetModel.belongsTo(UserModel, { foreignKey: "user_id", as: "passwordResetUser" });

UserModel.hasMany(AssetModel, { foreignKey: "user_id", onDelete: "CASCADE", as: "assets" });
AssetModel.belongsTo(UserModel, { foreignKey: "user_id", as: "assetUser" });

export { sequelize };
