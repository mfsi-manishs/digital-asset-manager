/**
 * @file apiKey.model.ts
 * @fileoverview This file contains the api key model
 */

import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../config/db.config.js";

export interface ApiKeyAttributes {
  id: string;
  name: string;
  keyHash: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ApiKeyCreationAttributes = Optional<ApiKeyAttributes, "id" | "isActive">;

export class ApiKeyModel extends Model<ApiKeyAttributes, ApiKeyCreationAttributes> implements ApiKeyAttributes {
  public id!: string;
  public name!: string;
  public keyHash!: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApiKeyModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    keyHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "key_hash",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "api_keys",
    sequelize,
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["key_hash"],
      },
    ],
  }
);
