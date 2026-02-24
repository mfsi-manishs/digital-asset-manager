/**
 * @file apiKey.middleware.ts
 * @fileoverview This file contains the api key middleware
 */

import type { NextFunction, Request, Response } from "express";
import { models } from "../models/index.model.js";
import { hashApiKey } from "../utils/crypto.utils.js";

/**
 * Express middleware to authenticate the request using the provided API key
 * If the API key is invalid or does not exist, an HTTP 403 status code will be returned
 * If the API key is valid, the next function will be called
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Next function to call
 */
export const apiKeyAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
      return res.status(401).json({
        message: "API key is required",
      });
    }

    const keyHash = hashApiKey(apiKey);
    const existingKey = await models.ApiKeyModel.findOne({
      where: {
        keyHash,
        isActive: true,
      },
    });
    if (!existingKey) {
      return res.status(403).json({
        message: "Invalid API key",
      });
    }

    return next();
  } catch (error) {
    next(error);
  }
};
