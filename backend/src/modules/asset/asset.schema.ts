/**
 * @file asset.schema.ts
 * @fileoverview This file contains the asset schema
 */

import {
  ASSET_FILE_STATUS,
  ASSET_FILE_TYPES,
  type AssetMetadata,
  type SignedUrls,
  type StorageData,
} from "@digital-asset-manager/shared";
import type { ParamsDictionary } from "express-serve-static-core";
import { z } from "zod";

export const updateAssetReqParamsSchema = z.object({ id: z.coerce.number().min(1) });
export type UpdateAssetReqParams = z.infer<typeof updateAssetReqParamsSchema> & ParamsDictionary;

export const updateAssetInternalReqParamsSchema = z.object({
  userId: z.coerce.number().min(1),
  id: z.coerce.number().min(1),
});
export type UpdateAssetInternalReqParams = z.infer<typeof updateAssetInternalReqParamsSchema> & ParamsDictionary;

export const updateAssetReqBodySchema = z.object({
  status: z.enum(Object.values(ASSET_FILE_STATUS)).default(ASSET_FILE_STATUS.pending),
  processingJobId: z.string().optional(),
  processingQueue: z.string().optional(),
  processingAttempts: z.number().optional(),
  lastError: z.string().optional(),
  metadata: z.object<AssetMetadata>().optional(),
  storage: z.object<StorageData>().optional(),
  signedUrls: z.object<SignedUrls>().optional(),
});
export type UpdateAssetReqBody = z.infer<typeof updateAssetReqBodySchema>;

export const updateAssetResSchema = z.object({
  id: z.number(),
  userId: z.number(),
  originalName: z.string(),
  type: z.enum(Object.values(ASSET_FILE_TYPES)),
  status: z.enum(Object.values(ASSET_FILE_STATUS)).default(ASSET_FILE_STATUS.pending),
  mimeType: z.string(),
  size: z.number(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  processingJobId: z.string().nullable().optional(),
  processingQueue: z.string().nullable().optional(),
  processingAttempts: z.number().optional(),
  lastError: z.string().nullable().optional(),
  metadata: z.object<AssetMetadata>().optional(),
  storage: z.object<StorageData>().optional(),
  signedUrls: z.object<SignedUrls>().optional(),
});
export type UpdateAssetResDTO = z.infer<typeof updateAssetResSchema>;

export const uploadUrlReqBodySchema = z.object({
  fileName: z.string().trim(),
  mimeType: z.string().trim(),
});
export type UploadUrlReqBody = z.infer<typeof uploadUrlReqBodySchema>;

export const uploadUrlResSchema = z.object({
  assetId: z.number(),
  uploadUrl: z.string(),
  objectKey: z.string(),
  bucketName: z.string(),
});
export type UploadUrlResDTO = z.infer<typeof uploadUrlResSchema>;

export const uploadConfirmReqBodySchema = z.object({
  assetId: z.number(),
  objectKey: z.string(),
  bucketName: z.string(),
});
export type UploadConfirmReqBody = z.infer<typeof uploadConfirmReqBodySchema>;

export const uploadResSchema = z.object({
  assetId: z.number().optional(),
  filename: z.string(),
  mimeType: z.string(),
  status: z.string(),
});
export type UploadResDTO = z.infer<typeof uploadResSchema>;
