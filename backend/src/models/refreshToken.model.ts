/**
 * @file refreshToken.model.ts
 * @fileoverview This file contains the refresh token model in Sequelize
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

export class RefreshTokenModel extends Model<
  InferAttributes<RefreshTokenModel>,
  InferCreationAttributes<RefreshTokenModel>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare tokenHash: string;
  declare ipAddress: string;
  declare userAgent: string;
  declare expiresAt: Date;
  declare readonly createdAt: CreationOptional<Date>;
}

RefreshTokenModel.init(
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
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "ip_address",
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "user_agent",
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
    tableName: "refresh_tokens",
    timestamps: true,
    updatedAt: false, // disables updatedAt
    underscored: true,
    indexes: [
      {
        fields: ["expires_at"],
        // Sequelize does not support TTL indexes directly like MongoDB.
        // Need a cron job or database-specific feature (e.g., Postgres `ON DELETE` trigger).
      },
    ],
  }
);

RefreshTokenModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
