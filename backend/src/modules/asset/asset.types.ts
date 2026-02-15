/**
 * @file asset.types.ts
 * @fileoverview This file contains the asset types
 */

/**
 * @interface QueueData
 * @description Queue data
 */
export interface QueueData {
  assetId: number;
  userId: number;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
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
