/**
 * @file image.utils.ts
 * @fileoverview This file contains the image utils
 */

import path from "path";
import sharp from "sharp";
import { RESOLUTIONS, type ResolutionNames } from "../models/asset.model.js";

/**
 * @class ImageUtils
 * @description This class contains the image utils methods
 */
export class ImageUtils {
  /**
   * Generates image resolutions based on the RESOLUTIONS constant.
   * The function takes an original image path, resizes it according to the resolutions
   * defined in RESOLUTIONS, and saves the resized images to the same directory as the original
   * image with the same file name but with the resolution name appended.
   * @param originalPath - The path of the original image
   * @returns A promise that resolves to a record where the keys are the resolution names and the values
   * are the paths of the resized images
   */
  static async generateImageResolutions(originalPath: string): Promise<Record<ResolutionNames, string>> {
    const output: Partial<Record<ResolutionNames, string>> = {};

    const directory = path.dirname(originalPath);
    const extension = path.extname(originalPath);
    const baseName = path.basename(originalPath, extension);

    const resizePromises = Object.entries(RESOLUTIONS).map(async ([key, resolution]) => {
      const typedKey = key as ResolutionNames;

      const outputPath = path.join(directory, `${baseName}-${resolution.name}${extension}`);

      await sharp(originalPath)
        .resize(resolution.width, resolution.height, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(outputPath);

      output[typedKey] = outputPath;
    });

    await Promise.all(resizePromises);

    return output as Record<ResolutionNames, string>;
  }
}
