/**
 * @file asset.route.ts
 * @fileoverview This file contains the asset routes
 */

import express from "express";
import { apiKeyAuthenticate } from "../../middlewares/apiKey.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { AssetController } from "./asset.controller.js";

/**
 * @returns {Router} Express router with asset routes
 * @description This function returns an Express router with the asset routes
 * It contains a single route for uploading multiple files to the server
 */
export default function assetRoutes() {
  const router = express.Router();

  router.patch("/:id", authenticate, AssetController.updateAsset);
  router.post("/upload-url", authenticate, AssetController.uploadUrl);
  router.post("/upload-confirm", authenticate, AssetController.uploadConfirm);
  router.patch("/internal/:userId/:id", apiKeyAuthenticate, AssetController.updateAssetInternal);

  return router;
}
