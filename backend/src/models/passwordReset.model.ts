/**
 * @file passwordReset.model.ts
 * @fileoverview This file contains the password reset model using Sequelize
 */

import {
  DataTypes,
  Model,
  Sequelize,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../packages/shared/db/db.config.js";
import { UserModel } from "./user.model.js";

export class PasswordResetModel extends Model<
  InferAttributes<PasswordResetModel>,
  InferCreationAttributes<PasswordResetModel>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare readonly createdAt: CreationOptional<Date>;
}

// Initialize model
PasswordResetModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
      onDelete: "CASCADE",
      field: "user_id",
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "token_hash",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
    // timestamps
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "password_resets",
    timestamps: true, // adds createdAt,updatedAt automatically
    updatedAt: false, // don't add updatedAt
    underscored: true,
    indexes: [
      {
        fields: ["expires_at"],
      },
    ],
  }
);

// Associations (PasswordReset belongs to User)
PasswordResetModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
