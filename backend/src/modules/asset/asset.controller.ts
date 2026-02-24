/**
 * @file asset.controller.ts
 * @fileoverview This file contains the asset controller
 */

import type { Request, Response } from "express";
import {
  updateAssetResSchema,
  uploadResSchema,
  uploadUrlResSchema,
  type UpdateAssetInternalReqParams,
  type UpdateAssetReqBody,
  type UpdateAssetReqParams,
  type UploadConfirmReqBody,
  type UploadUrlReqBody,
} from "./asset.schema.js";
import { AssetService } from "./asset.service.js";

/**
 * @class AssetController
 * @description This class contains the asset controller
 */
export class AssetController {
  /**
   * Updates an asset in the database.
   * @param {Request<UpdateAssetReqParams, object, UpdateAssetReqBody>} req - The request object
   * @param {Response} res - The response object
   * @returns {Promise<void>} The promise that resolves when the asset is updated
   * @throws {BadRequestError} If the assetId or userId is missing or invalid
   * @throws {InternalServerError} If unable to update asset
   */
  static async updateAsset(req: Request<UpdateAssetReqParams, object, UpdateAssetReqBody>, res: Response) {
    const resData = await AssetService.update(req.user!.id, req.params.id, req.body);
    const validatedResData = updateAssetResSchema.parse(resData);
    res.json(validatedResData);
  }

  /**
   * Updates an asset in the database.
   * @param {Request<UpdateAssetInternalReqParams, object, UpdateAssetReqBody>} req - The request object
   * @param {Response} res - The response object
   * @returns {Promise<void>} The promise that resolves when the asset is updated
   * @throws {BadRequestError} If the assetId or userId is missing or invalid
   * @throws {InternalServerError} If unable to update asset
   * @description This function is used to update an asset in the database. It takes the userId and assetId as params, and the body of the request contains the data to be updated.
   */
  static async updateAssetInternal(
    req: Request<UpdateAssetInternalReqParams, object, UpdateAssetReqBody>,
    res: Response
  ) {
    const resData = await AssetService.update(req.params.userId, req.params.id, req.body);
    const validatedResData = updateAssetResSchema.parse(resData);
    res.json(validatedResData);
  }

  /**
   * Uploads a file to the server and creates an Asset record in the database.
   * The actual processing of the file is done in the background using a message queue (BullMQ).
   * @param {Request<object, object, UploadUrlReqBody>} req - The express request object
   * @param {Response} res - The express response object
   * @returns {Promise<void>} The promise that resolves when the asset is created
   * @throws {BadRequestError} If the userId or assetId is missing or invalid
   * @throws {InternalServerError} If unable to create asset
   */
  static async uploadUrl(req: Request<object, object, UploadUrlReqBody>, res: Response) {
    const resData = await AssetService.uploadUrl(req.user!.id, req.body);
    const validatedResData = uploadUrlResSchema.parse(resData);
    res.json(validatedResData);
  }

  /**
   * Confirms the upload of an asset to the server.
   * @param {Request<object, object, UploadConfirmReqBody>} req - The express request object
   * @param {Response} res - The express response object
   * @returns {Promise<void>} The promise that resolves when the asset is confirmed
   * @throws {BadRequestError} If the userId or assetId is missing or invalid
   * @throws {InternalServerError} If unable to confirm asset
   * @description This function is used to confirm an asset has been uploaded to the server. It takes the userId and assetId as params, and the body of the request contains the data to be confirmed.
   */
  static async uploadConfirm(req: Request<object, object, UploadConfirmReqBody>, res: Response) {
    const resData = await AssetService.uploadConfirm(req.user!.id, req.body);
    const validatedResData = uploadResSchema.parse(resData);
    res.json(validatedResData);
  }
}
