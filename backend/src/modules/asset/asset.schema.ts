/**
 * @file asset.schema.ts
 * @fileoverview This file contains the asset schema
 */

/**
 * @interface UploadResDTO
 * @description Upload response data transfer object
 */
export interface UploadResDTO {
  filename: string;
  mimeType: string;
  status: string;
  message?: string;
}
