/**
 * @file asset.route.ts
 * @fileoverview This file contains the asset routes
 */

import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { uploadMultiple } from "../../middlewares/upload.middleware.js";
import { AssetController } from "./asset.controller.js";

/**
 * @returns {Router} Express router with asset routes
 * @description This function returns an Express router with the asset routes
 * It contains a single route for uploading multiple files to the server
 */
export default function assetRoutes() {
  const router = express.Router();

  router.post("/upload", authenticate, uploadMultiple, AssetController.upload);

  return router;
}
