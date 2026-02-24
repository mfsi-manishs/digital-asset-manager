/**
 * @file asset.mapper.ts
 * @fileoverview This file contains the function to map asset to dto.
 */

import type { AssetModel } from "../../models/asset.model.js";
import type { UploadResDTO, UploadUrlResDTO } from "./asset.schema.js";

export const toUpdateAssetResDTO = (asset: AssetModel): AssetModel => asset;

/**
 * Maps an asset to an upload url response dto.
 * @param {AssetModel} asset - The asset to map
 * @param {string} presignedUrl - The presigned url to upload the asset
 * @returns {UploadUrlResDTO} The mapped upload url response dto
 */
export const toUploadUrlResDTO = (asset: AssetModel, presignedUrl: string): UploadUrlResDTO => ({
  assetId: asset.id,
  uploadUrl: presignedUrl,
  objectKey: asset.storage.originalFile.objectKey,
  bucketName: asset.storage.originalFile.bucketName,
});

/**
 * Maps an asset to an upload response dto.
 * @param {AssetModel} asset - The asset to map
 * @returns {UploadResDTO} The mapped upload response dto
 */
export const toUploadResDTO = (asset: AssetModel): UploadResDTO => ({
  assetId: asset.id,
  filename: asset.originalName,
  status: asset.status,
  mimeType: asset.mimeType,
});
