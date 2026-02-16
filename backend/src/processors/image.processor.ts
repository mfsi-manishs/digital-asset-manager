/**
 * @file image.processor.ts
 * @fileoverview This file contains the image processor
 */

import type { Job } from "bullmq";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { AssetService } from "../modules/asset/asset.service.js";
import type { ObjectMetadata, QueueData } from "../modules/asset/asset.types.js";
import { BUCKET_NAMES, ensureBucket, minioClient } from "../packages/shared/minio/minio.config.js";
import type { BucketObject, ImageMetadata, ResolutionNames } from "../packages/shared/types/asset.type.js";
import { ImageUtils } from "../utils/image.utils.js";

ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
ffmpeg.setFfprobePath(ffprobePath.path);

export default async function imageProcessor(job: Job<QueueData>) {
  const { filePath, userId, assetId } = job.data;
  try {
    console.log(`Processing image: ${filePath}`);

    await AssetService.update(userId, assetId, { status: "processing" });

    // Example: check file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get image metadata of original file
    const stats = fs.lstatSync(filePath);
    const metadata = await sharp(filePath).metadata();
    const imgMetadata = toImageMetadata(path.extname(filePath), stats.ctime, stats.mtime, job.data, metadata);

    // Generate thumbnail
    const thumbnailPath = path.join(path.dirname(filePath), "thumbnail-" + path.basename(filePath));
    await sharp(filePath).resize(200).toFile(thumbnailPath);

    // Generate various image resolutions
    const generatedPaths = await ImageUtils.generateImageResolutions(filePath);

    const objMetadata: ObjectMetadata = { userId: String(userId), assetId: String(assetId) };

    await ensureBucket(BUCKET_NAMES.damimages);

    // Upload original file to MinIO
    const { etag: etagOriginal } = await minioClient.fPutObject(
      BUCKET_NAMES.damimages,
      filePath,
      filePath,
      objMetadata
    );

    // Upload thumbnail file to MinIO
    const { etag: etagThumbnail } = await minioClient.fPutObject(
      BUCKET_NAMES.damimages,
      thumbnailPath,
      thumbnailPath,
      objMetadata
    );

    const processedFiles = {} as Record<ResolutionNames, BucketObject>;

    // Upload processed files
    for (const [resolution, filePath] of Object.entries(generatedPaths) as [ResolutionNames, string][]) {
      const { etag } = await minioClient.fPutObject(BUCKET_NAMES.damimages, filePath, filePath, objMetadata);

      processedFiles[resolution] = {
        bucketName: BUCKET_NAMES.damimages,
        objectKey: filePath,
        etag,
      };
    }

    // Update asset in database
    await AssetService.update(userId, assetId, {
      status: "ready",
      metadata: imgMetadata,
      storage: {
        originalFile: {
          bucketName: BUCKET_NAMES.damimages,
          objectKey: filePath,
          etag: etagOriginal,
        },
        thumbnailPreviewFile: {
          bucketName: BUCKET_NAMES.damimages,
          objectKey: thumbnailPath,
          etag: etagThumbnail,
        },
        processedFiles,
      },
    });
  } catch (error) {
    await AssetService.update(userId, assetId, { status: "failed" });
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
    filePath: jobData.filePath,
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
