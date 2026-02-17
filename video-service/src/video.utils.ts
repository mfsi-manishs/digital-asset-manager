/**
 * @file video.utils.ts
 * @fileoverview This file contains the video utils
 */

import { RESOLUTIONS, type ResolutionNames } from "@digital-asset-manager/shared";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

/**
 * @class VideoUtils
 * @description This class contains the video utils methods
 */
export class VideoUtils {
  /**
   * Generates a 10 second preview clip of a video at the 5th second mark.
   * The ffmpeg flags -movflags frag_keyframe+empty_moov are used to create fragmented MP4 files (fMP4) which is ideal for streaming.
   * - frag_keyframe: breaks the file into fragments at keyframes, while
   * - empty_moov: places the metadata at the start of the file without a header, making the file immediately playable.
   * @param {string} inputPath - The path of the input video file.
   * @param {string} outputPath - The path of the output preview clip file.
   * @returns {Promise<void>} A promise that resolves when the preview clip has been generated.
   */
  static async generatePreviewClip(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime("00:00:05")
        .setDuration(5)
        .outputOptions("-movflags frag_keyframe+empty_moov")
        .save(outputPath)
        .on("progress", (progress) => {
          console.log(`Generating preview clip: ${progress.percent?.toFixed(2)}%`);
        })
        .on("end", () => resolve())
        .on("error", reject);
    });
  }

  /**
   * Generates video resolutions based on the RESOLUTIONS constant.
   * The function takes an original video path, resizes it according to the resolutions
   * defined in RESOLUTIONS, and saves the resized videos to the same directory as the original
   * video with the same file name but with the resolution name appended.
   * @param {string} inputPath - The path of the original video file
   * @returns {Promise<Record<ResolutionNames, string>>} A promise that resolves to a record where the keys are the resolution names and the values are the paths of the resized videos
   */
  static async generateVideoResolutions(inputPath: string): Promise<Record<ResolutionNames, string>> {
    const output: Partial<Record<ResolutionNames, string>> = {};

    const directory = path.dirname(inputPath);
    const extension = path.extname(inputPath);
    const baseName = path.basename(inputPath, extension);

    const resizePromises = Object.entries(RESOLUTIONS).map(async ([key, resolution]) => {
      const typedKey = key as ResolutionNames;

      const outputPath = path.join(directory, `${baseName}-${resolution.name}${extension}`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec("libx264")
          .size(`${resolution.width}x${resolution.height}`)
          .outputOptions(["-preset veryfast", "-crf 23", "-movflags +faststart"])
          .save(outputPath)
          .on("progress", (progress) => {
            console.log(`Processing ${resolution.name} video: ${progress.percent?.toFixed(2)}%`);
          })
          .on("end", () => resolve())
          .on("error", reject);
      });
      output[typedKey] = outputPath;
    });
    await Promise.all(resizePromises);

    return output as Record<ResolutionNames, string>;
  }
}
