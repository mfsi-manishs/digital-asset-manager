/**
 * @file asset.type.ts
 * @fileoverview This file contains the asset type
 */

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
  pending: "pending", // record created in db with generation of presigned url
  uploading: "uploading", // file being uploaded to storage
  uploaded: "uploaded", // file successfully uploaded to storage
  processing: "processing", // file is being processed
  ready: "ready", // file is processed and ready to download
  failed: "failed", // file uploading or processing failed
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
  duration: number | undefined; // in seconds
  fps: number; // frames per second
  width: number | undefined;
  height: number | undefined;
  codec: string | undefined; // e.g., "H.264", "HEVC"
  bitrate?: number | undefined; // kbps
  aspectRatio?: string | undefined; // e.g., "16:9"
  audioChannels?: number | undefined; // e.g., 2 for stereo
  subtitleTracks?: string[]; // list of languages or track IDs
  containerFormat: string | undefined; // e.g., "MP4", "MKV"
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
  etag?: string | undefined;
}

export interface StorageData {
  originalFile: BucketObject;
  thumbnailPreviewFile?: BucketObject;
  processedFiles?: Record<ResolutionNames, BucketObject>;
}

export interface SignedUrls {
  [key: string]: string;
}

/**
 * @interface QueueData
 * @description Queue data
 */
export interface QueueData {
  bucketName: string;
  objectKey: string;
  assetId: number;
  userId: number;
  originalName: string;
  mimeType: string;
  fileSize: number;
}

/**
 * @interface ObjectMetadata
 * @description Object metadata to be stored in MinIO with each object
 */
export interface ObjectMetadata {
  userId: string;
  assetId: string;
  [key: string]: string | number; // This allows the index signature required by MinIO
}
