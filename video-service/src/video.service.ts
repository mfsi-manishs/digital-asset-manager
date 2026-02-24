/**
 * @file video.service.ts
 * @fileoverview This file contains the video service
 */

import { getEnv, type AssetFileStatus } from "@digital-asset-manager/shared";
import api from "./axios.config.js";

/**
 * @constant API_CONFIG
 * @description This constant contains the api config
 */
const API_CONFIG = {
  updateAsset: {
    targetPath: (userId: number, assetId: number) => `/assets/internal/${userId}/${assetId}`,
    headers: {
      "x-api-key": getEnv().services.videoServiceApiKey,
    },
  },
};

/**
 * @class VideoService
 * @description This class contains the video service
 */
export class VideoService {
  static async updateAsset(userId: number, assetId: number, status: AssetFileStatus, payload?: unknown) {
    await api.patch(API_CONFIG.updateAsset.targetPath(userId, assetId), { ...(payload as object), status, userId });
  }
}
