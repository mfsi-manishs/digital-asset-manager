/**
 * @file asset.service.ts
 * @fileoverview This file contains the asset service
 */

import { models } from "../../models/index.model.js";

/**
 * @class AssetService
 * @description This class contains the asset service
 */
export class AssetService {
  /**
   * Creates a new asset in the database.
   * @param {number} userId - The id of the user who owns the asset
   * @param {Object} data - The data of the asset to be created
   * @param {string} data.originalName - The original name of the asset
   * @param {string} data.type - The type of the asset (image, video, audio, document, other)
   * @param {string} data.status - The status of the asset (uploaded, processing, ready, failed)
   * @param {string} data.mimeType - The MIME type of the asset
   * @param {number} data.size - The size of the asset in bytes
   * @returns {Promise<AssetModel>} The created asset
   */
  static async create(
    userId: number,
    data: { originalName: string; type: string; status: string; mimeType: string; size: number }
  ) {
    return await models.AssetModel.create({
      userId,
      originalName: data.originalName,
      type: data.type,
      status: "uploaded",
      mimeType: data.mimeType,
      size: data.size,
    });
  }
}
