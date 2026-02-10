/**
 * @file user.model.ts
 * @fileoverview This file contains the user model
 */

import {
  DataTypes,
  Model,
  Sequelize,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/db.config.js";

export const USER_ROLES = {
  user: "user",
  admin: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role?: CreationOptional<UserRole>;
  declare lastLoginAt?: CreationOptional<Date | null>;
  declare loginAttempts?: CreationOptional<number>;
  declare lockUntil?: CreationOptional<Date | null>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(128),
      allowNull: false,
      field: "password_hash",
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLES)),
      allowNull: false,
      defaultValue: "user",
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login_at",
    },
    loginAttempts: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "login_attempts",
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "lock_until",
    },
    // timestamps
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "created_at",
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);
