/**
 * @file asset.model.ts
 * @fileoverview This file contains the asset model
 */

import {
  ASSET_FILE_STATUS,
  ASSET_FILE_TYPES,
  type AssetFileStatus,
  type AssetFileType,
  type AssetMetadata,
  type SignedUrls,
  type StorageData,
} from "@digital-asset-manager/shared";
import {
  DataTypes,
  Model,
  Sequelize,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/db.config.js";
import { UserModel } from "./user.model.js";

export class AssetModel extends Model<InferAttributes<AssetModel>, InferCreationAttributes<AssetModel>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare originalName: string;
  declare type: AssetFileType;
  declare status: CreationOptional<AssetFileStatus>;
  declare mimeType: string;
  declare size: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare processingJobId: CreationOptional<string>;
  declare processingQueue: CreationOptional<string>;
  declare processingAttempts: CreationOptional<number>;
  declare lastError: CreationOptional<string>;
  declare metadata: CreationOptional<AssetMetadata>;
  declare storage: CreationOptional<StorageData>;
  declare signedUrls: CreationOptional<SignedUrls>;
}

AssetModel.init(
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
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "user_id",
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "original_name",
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ASSET_FILE_TYPES)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ASSET_FILE_STATUS)),
      defaultValue: ASSET_FILE_STATUS.uploaded,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "mime_type",
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      field: "updated_at",
    },
    processingJobId: {
      type: DataTypes.STRING,
      field: "processing_job_id",
    },
    processingQueue: {
      type: DataTypes.STRING,
      field: "processing_queue",
    },
    processingAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "processing_attempts",
    },
    lastError: {
      type: DataTypes.TEXT,
      field: "last_error",
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    storage: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    signedUrls: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: "assets",
    sequelize: sequelize,
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "type", "status"],
      },
      {
        fields: ["user_id", "status"],
      },
    ],
  }
);

AssetModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
