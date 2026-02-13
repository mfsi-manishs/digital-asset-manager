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
export type AssetFileType = keyof typeof ASSET_FILE_TYPES;

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
export type AssetFileStatus = keyof typeof ASSET_FILE_STATUS;

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
  format: string;
  width: number;
  height: number;
  colorSpace: string; // e.g., "RGB", "CMYK"
  channels: number;
  dpi?: number | undefined;
  compression?: string | undefined; // e.g., "JPEG", "PNG"
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

export interface Resolution {
  name: string;
  width: number;
  height: number;
}

/**
 * @constant RESOLUTIONS
 * @description Available image resolutions
 * - Important: The property key should be exaclty same as the name property of the Resolution object.
 */
export const RESOLUTIONS = {
  HD: { name: "HD", width: 1280, height: 720 } as Resolution,
  FHD: { name: "FHD", width: 1920, height: 1080 } as Resolution,
};

export type ResolutionNames = keyof typeof RESOLUTIONS;

export interface BucketObject {
  bucketName: string;
  objectKey: string;
  etag: string | undefined;
}

export interface StorageData {
  originalFile: BucketObject;
  thumbnailPreviewFile: BucketObject;
  processedFiles: Record<ResolutionNames, BucketObject>;
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
