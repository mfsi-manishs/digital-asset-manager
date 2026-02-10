/**
 * @file asset.model.ts
 * @fileoverview This file contains the asset model
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
import { UserModel } from "./user.model.js";

/**
 * @constant ASSET_FILE_TYPES
 * @description Asset file types
 */
export const ASSET_FILE_TYPES = {
  image: "image",
  video: "video",
  audio: "audio",
  document: "document",
  other: "other",
};
export type AssetFileType = (typeof ASSET_FILE_TYPES)[keyof typeof ASSET_FILE_TYPES];

/**
 * @constant ASSET_FILE_STATUS
 * @description Asset file status
 */
export const ASSET_FILE_STATUS = {
  uploaded: "uploaded",
  processing: "processing",
  ready: "ready",
  failed: "failed",
};
export type AssetFileStatus = (typeof ASSET_FILE_STATUS)[keyof typeof ASSET_FILE_STATUS];

/**
 * @interface FileMetadata
 * @description File metadata common across all file types.
 */
export interface FileMetadata {
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // e.g., "jpg", "mp4", "pdf"
  filePath: string;
  dateCreated: Date;
  dateModified: Date;
  mimeType: string;
  extension: string;
}

/**
 * @interface ImageMetadata
 * @description Image metadata
 */
export interface ImageMetadata extends FileMetadata {
  width: number;
  height: number;
  colorSpace?: string; // e.g., "RGB", "CMYK"
  colorDepth?: number; // bits per pixel
  channels?: number;
  dpi?: number;
  compression?: string; // e.g., "JPEG", "PNG"
  orientation?: string; // e.g., "portrait", "landscape"
}

/**
 * @interface VideoMetadata
 * @description Video metadata
 */
export interface VideoMetadata extends FileMetadata {
  duration: number; // in seconds
  fps: number; // frames per second
  resolution: { width: number; height: number };
  codec: string; // e.g., "H.264", "HEVC"
  bitrate?: number; // kbps
  aspectRatio?: string; // e.g., "16:9"
  audioChannels?: number; // e.g., 2 for stereo
  subtitleTracks?: string[]; // list of languages or track IDs
  containerFormat: string; // e.g., "MP4", "MKV"
}

export type AssetMetadata = FileMetadata | ImageMetadata | VideoMetadata;

export interface StorageData {
  [key: string]: string;
}

export interface SignedUrls {
  [key: string]: string;
}

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
  declare metadata: CreationOptional<Record<string, AssetMetadata>>;
  declare storage: CreationOptional<Record<string, StorageData>>;
  declare signedUrls: CreationOptional<Record<string, SignedUrls>>;
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
