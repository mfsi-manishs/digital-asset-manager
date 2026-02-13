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
