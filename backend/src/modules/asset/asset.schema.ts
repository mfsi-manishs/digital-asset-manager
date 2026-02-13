/**
 * @file asset.schema.ts
 * @fileoverview This file contains the asset schema
 */

/**
 * @interface UploadResDTO
 * @description Upload response data transfer object
 */
export interface UploadResDTO {
  assetId?: number;
  filename: string;
  mimeType: string;
  status: string;
  message?: string;
}
