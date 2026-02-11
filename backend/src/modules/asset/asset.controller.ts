/**
 * @file asset.controller.ts
 * @fileoverview This file contains the asset controller
 */

import type { Request, Response } from "express";
import { ASSET_FILE_STATUS, ASSET_FILE_TYPES } from "../../models/asset.model.js";
import { imageQueue } from "../../services/imageQueue.service.js";
import { videoQueue } from "../../services/videoQueue.service.js";
import type { UploadResDTO } from "./asset.schema.js";
import { AssetService } from "./asset.service.js";

/**
 * @class AssetController
 * @description This class contains the asset controller
 */
export class AssetController {
  /**
   * Uploads multiple files to the server and creates corresponding corresponding Asset records
   * in the database. The actual processing of the files is done in the background
   * using a message queue (BullMQ).
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @returns {Promise<void>}
   */
  static async upload(req: Request, res: Response) {
    if (!req.files || !(req.files instanceof Array)) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const results: UploadResDTO[] = [];

    for (const file of files) {
      const filePath = file.path;
      const mimeType = file.mimetype;
      const originalName = file.originalname;
      const size = file.size;
      const status = ASSET_FILE_STATUS.uploaded;

      const type = mimeType.split("/")[0];

      if (type?.match(/image/i)) {
        const asset = await AssetService.create(req.user!.id, {
          originalName,
          type: ASSET_FILE_TYPES.image,
          status,
          mimeType,
          size,
        });
        await imageQueue.add(`processImage-${asset.id}-${originalName}`, { filePath, assetId: asset.id });
        results.push({ filename: originalName, mimeType, status: "queued" });
      } else if (type?.match(/video/i)) {
        const asset = await AssetService.create(req.user!.id, {
          originalName,
          type: ASSET_FILE_TYPES.video,
          status,
          mimeType,
          size,
        });
        await videoQueue.add(`processVideo-${asset.id}-${originalName}`, { filePath, assetId: asset.id });
        results.push({ filename: originalName, mimeType, status: "queued" });
      } else {
        results.push({
          filename: originalName,
          mimeType,
          status: "failed",
          message: "Unsupported file type",
        });
      }
    }

    return res.json(results);
  }
}
