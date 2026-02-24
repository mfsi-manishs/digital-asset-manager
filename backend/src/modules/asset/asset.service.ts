/**
 * @file asset.service.ts
 * @fileoverview This file contains the asset service
 */

import {
  ASSET_FILE_STATUS,
  ASSET_FILE_TYPES,
  type AssetFileStatus,
  type AssetFileType,
  type AssetMetadata,
  BUCKET_NAMES,
  type QueueData,
  type SignedUrls,
  type StorageData,
  getObjectInfo,
  imageQueue,
  minioClient,
  videoQueue,
} from "@digital-asset-manager/shared";
import { v4 as uuid } from "uuid";
import { models } from "../../models/index.model.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../../utils/error.utils.js";
import { toUpdateAssetResDTO, toUploadResDTO, toUploadUrlResDTO } from "./asset.mapper.js";
import type { UpdateAssetReqBody, UploadConfirmReqBody, UploadResDTO, UploadUrlReqBody } from "./asset.schema.js";

/**
 * @class AssetService
 * @description This class contains the asset service
 */
export class AssetService {
  static PRESIGNED_URL_EXPIRY = 60 * 10; // 10 minutes
  /**
   * Creates a new asset in the database.
   * @param {number} userId - The id of the user who owns the asset
   * @param {Object} data - The data of the asset to be created
   * @param {string} data.originalName - The original name of the asset
   * @param {string} data.type - The type of the asset (image, video, audio, document, other)
   * @param {string} data.mimeType - The MIME type of the asset
   * @param {Object} data.storage - The storage data of the asset
   * @returns {Promise<AssetModel>} The created asset
   */
  static async create(
    userId: number,
    data: { originalName: string; type: AssetFileType; mimeType: string; storage: StorageData }
  ) {
    return await models.AssetModel.create({
      userId,
      originalName: data.originalName,
      type: data.type,
      mimeType: data.mimeType,
      storage: data.storage,
    });
  }

  /**
   * Updates an asset in the database.
   * @param {number} userId - The id of the user who owns the asset
   * @param {number} assetId - The id of the asset to be updated
   * @param {Object} data - The data to be updated
   * @param {string} data.originalName - The original name of the asset
   * @param {string} data.type - The type of the asset (image, video, audio, document, other)
   * @param {string} data.mimeType - The MIME type of the asset
   * @param {Object} data.storage - The storage data of the asset
   * @returns {Promise<UpdateAssetResDTO>} The updated asset
   * @throws {NotFoundError} If asset not found or unauthorized
   */
  static async update(userId: number, assetId: number, data: UpdateAssetReqBody) {
    const asset = await models.AssetModel.findOne({
      where: { id: assetId, userId: userId },
    });

    if (!asset) {
      throw new NotFoundError("Asset not found or unauthorized");
    }

    if (data.metadata) {
      data.metadata = {
        ...asset.metadata,
        ...data.metadata,
      };
    }
    if (data.storage) {
      data.storage = {
        ...asset.storage,
        ...data.storage,
      };
    }

    await asset.update({
      ...data,
      status: (data.status as AssetFileStatus) || asset.status,
      processingJobId: data.processingJobId || asset.processingJobId,
      processingQueue: data.processingQueue || asset.processingQueue,
      processingAttempts: data.processingAttempts || asset.processingAttempts,
      lastError: data.lastError || asset.lastError,
      metadata: (data.metadata as AssetMetadata) || asset.metadata,
      storage: (data.storage as StorageData) || asset.storage,
      signedUrls: (data.signedUrls as SignedUrls) || asset.signedUrls,
    });
    return toUpdateAssetResDTO(await asset.reload());
  }

  /**
   * Initiates an upload of an asset to the server by generating a presigned URL.
   * @param {number} userId - The id of the user who owns the asset
   * @param {UploadUrlReqBody} reqBody - The body of the request containing the original name and MIME type of the asset
   * @returns {Promise<UploadUrlResDTO>} The presigned URL to upload the asset
   * @throws {BadRequestError} If the userId or assetId is missing or invalid
   * @throws {InternalServerError} If unable to initiate upload
   */
  static async uploadUrl(userId: number, reqBody: UploadUrlReqBody) {
    const { fileName, mimeType } = reqBody;
    let bucketName, fileType;
    const type = mimeType.split("/")[0];
    if (type?.match(/image/i)) {
      bucketName = BUCKET_NAMES.damimages;
      fileType = ASSET_FILE_TYPES.image as AssetFileType;
    } else if (type?.match(/video/i)) {
      bucketName = BUCKET_NAMES.damvideos;
      fileType = ASSET_FILE_TYPES.video as AssetFileType;
    } else {
      throw new BadRequestError("Unsupported file type");
    }

    const objectKey = `original/${uuid()}-${fileName}`;
    const presignedUrl = await minioClient.presignedPutObject(bucketName, objectKey, this.PRESIGNED_URL_EXPIRY);
    if (!presignedUrl) {
      throw new InternalServerError("Failed to initiate upload as unable to get presigned URL");
    }

    const asset = await AssetService.create(userId, {
      originalName: fileName,
      type: fileType,
      mimeType,
      storage: { originalFile: { bucketName, objectKey } },
    });

    if (!asset) {
      throw new InternalServerError("Failed to initiate upload as unable to create asset");
    }

    return toUploadUrlResDTO(asset, presignedUrl);
  }

  /**
   * Confirms the upload of an asset to the server.
   * @param {number} userId - The id of the user who owns the asset
   * @param {UploadConfirmReqBody} reqBody - The body of the request containing the assetId, object key, and bucket name of the asset
   * @returns {Promise<UploadResDTO>} The asset after confirmation
   * @throws {BadRequestError} If the asset is not found, unauthorized, or object key or bucket name mismatch
   * @throws {InternalServerError} If unable to process asset
   */
  static async uploadConfirm(userId: number, reqBody: UploadConfirmReqBody): Promise<UploadResDTO> {
    const { assetId, objectKey, bucketName } = reqBody;
    const asset = await models.AssetModel.findByPk(assetId);
    if (!asset) {
      throw new BadRequestError("Asset not found");
    } else if (asset.userId !== userId) {
      throw new BadRequestError("Unauthorized");
    } else if (asset.storage.originalFile.objectKey !== objectKey) {
      throw new BadRequestError("Object key mismatch");
    } else if (asset.storage.originalFile.bucketName !== bucketName) {
      throw new BadRequestError("Bucket name mismatch");
    }

    const objectInfo = await getObjectInfo(bucketName, objectKey);
    if (!objectInfo) {
      throw new BadRequestError("Object not found");
    }

    const { mimeType, originalName } = asset;
    const qData: QueueData = {
      bucketName,
      objectKey,
      assetId: asset.id,
      userId,
      originalName,
      mimeType,
      fileSize: objectInfo.size,
    };
    if (asset.type === ASSET_FILE_TYPES.image) {
      await imageQueue.add(`processImage-${asset.id}-${originalName}`, qData);
    } else if (asset.type === ASSET_FILE_TYPES.video) {
      await videoQueue.add(`processVideo-${asset.id}-${originalName}`, qData);
    } else {
      throw new BadRequestError("Unsupported file type");
    }
    asset.storage.originalFile.etag = objectInfo.etag;
    asset.size = objectInfo.size;
    asset.updatedAt = objectInfo.lastModified;
    asset.status = ASSET_FILE_STATUS.uploaded as AssetFileStatus;
    await asset.save();
    return toUploadResDTO(await asset.reload());
  }
}
