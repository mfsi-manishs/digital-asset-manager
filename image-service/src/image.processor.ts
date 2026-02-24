/**
 * @file image.processor.ts
 * @fileoverview This file contains the image processor
 */

import type {
  AssetFileStatus,
  BucketObject,
  ImageMetadata,
  ObjectMetadata,
  QueueData,
  ResolutionNames,
} from "@digital-asset-manager/shared";
import {
  ASSET_FILE_STATUS,
  BUCKET_NAMES,
  ensureBucket,
  getDownloadDirPath,
  minioClient,
} from "@digital-asset-manager/shared";
import type { Job } from "bullmq";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { ImageService } from "./image.service.js";
import { ImageUtils } from "./image.utils.js";

ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
ffmpeg.setFfprobePath(ffprobePath.path);

export default async function imageProcessor(job: Job<QueueData>) {
  const { bucketName, objectKey, userId, assetId, originalName } = job.data;
  const dirPath = getDownloadDirPath(import.meta.url);
  const filePath = path.join(dirPath, originalName);
  try {
    await minioClient.fGetObject(bucketName, objectKey, filePath);
    console.log(`Processing image: ${filePath}`);

    await ImageService.updateAsset(userId, assetId, ASSET_FILE_STATUS.processing as AssetFileStatus);

    // Example: check file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get image metadata of original file
    const stats = fs.lstatSync(filePath);
    const metadata = await sharp(filePath).metadata();
    const imgMetadata = toImageMetadata(path.extname(filePath), stats.ctime, stats.mtime, job.data, metadata);

    // Generate thumbnail
    const thumbnailPath = path.join(dirPath, "thumbnail-" + originalName);
    await sharp(filePath).resize(200).toFile(thumbnailPath);

    // Generate various image resolutions
    const generatedPaths = await ImageUtils.generateImageResolutions(filePath);

    const objMetadata: ObjectMetadata = { userId: String(userId), assetId: String(assetId) };

    await ensureBucket(BUCKET_NAMES.damimages);

    // Upload thumbnail file to MinIO
    const thumbObjKey = `processed/${uuid()}-${path.basename(thumbnailPath)}`;
    const { etag: etagThumbnail } = await minioClient.fPutObject(
      BUCKET_NAMES.damimages,
      thumbObjKey,
      thumbnailPath,
      objMetadata
    );

    const processedFiles = {} as Record<ResolutionNames, BucketObject>;

    // Upload processed files
    for (const [resolution, filePath] of Object.entries(generatedPaths) as [ResolutionNames, string][]) {
      const objKey = `processed/${uuid()}-${path.basename(filePath)}`;
      const { etag } = await minioClient.fPutObject(BUCKET_NAMES.damimages, objKey, filePath, objMetadata);

      processedFiles[resolution] = {
        bucketName: BUCKET_NAMES.damimages,
        objectKey: objKey,
        etag,
      };
    }

    await ImageService.updateAsset(userId, assetId, ASSET_FILE_STATUS.ready as AssetFileStatus, {
      metadata: imgMetadata,
      storage: {
        thumbnailPreviewFile: {
          bucketName: BUCKET_NAMES.damimages,
          objectKey: thumbObjKey,
          etag: etagThumbnail,
        },
        processedFiles,
      },
    });
  } catch (error) {
    await ImageService.updateAsset(userId, assetId, ASSET_FILE_STATUS.failed as AssetFileStatus);
    console.error(`Error processing image: ${filePath}`, error);
    throw error;
  }
}

const toImageMetadata = (
  ext: string,
  ctime: Date,
  mtime: Date,
  jobData: QueueData,
  metadata: sharp.Metadata
): ImageMetadata => {
  return {
    fileName: jobData.originalName,
    fileSize: jobData.fileSize,
    fileType: ext,
    dateCreated: ctime,
    dateModified: mtime,
    mimeType: jobData.mimeType,
    extension: ext,
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    colorSpace: metadata.space,
    channels: metadata.channels,
    dpi: metadata.density,
    compression: metadata.compression,
  };
};
