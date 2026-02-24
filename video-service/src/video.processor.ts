/**
 * @file video.processor.ts
 * @fileoverview This file contains the video processor
 */

import type {
  AssetFileStatus,
  BucketObject,
  ObjectMetadata,
  QueueData,
  ResolutionNames,
  VideoMetadata,
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
import ffmpeg, { type FfprobeData } from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { VideoService } from "./video.service.js";
import { VideoUtils } from "./video.utils.js";

ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
ffmpeg.setFfprobePath(ffprobePath.path);

export default async function videoProcessor(job: Job<QueueData>) {
  const { bucketName, objectKey, userId, assetId, originalName } = job.data;
  const dirPath = getDownloadDirPath(import.meta.url);
  const filePath = path.join(dirPath, originalName);
  try {
    await minioClient.fGetObject(bucketName, objectKey, filePath);
    console.log(`Processing video: ${filePath}`);

    await VideoService.updateAsset(userId, assetId, ASSET_FILE_STATUS.processing as AssetFileStatus);

    // Example: check file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get image metadata of original file
    const stats = fs.lstatSync(filePath);
    const metadata = await getVideoMetadata(filePath);
    const videoMetadata = toVideoMetadata(path.extname(filePath), stats.ctime, stats.mtime, job.data, metadata);

    // Generate thumbnail
    const previewPath = path.join(path.dirname(filePath), "thumbnail-" + path.basename(filePath));
    await VideoUtils.generatePreviewClip(filePath, previewPath);

    // Generate various image resolutions
    const generatedPaths = await VideoUtils.generateVideoResolutions(filePath);

    // Generate Preview
    const objMetadata: ObjectMetadata = { userId: String(userId), assetId: String(assetId) };

    await ensureBucket(BUCKET_NAMES.damvideos);

    // Upload thumbnail file to MinIO
    const previewObjKey = `processed/${uuid()}-${path.basename(previewPath)}`;
    const { etag: etagPreview } = await minioClient.fPutObject(
      BUCKET_NAMES.damvideos,
      previewObjKey,
      previewPath,
      objMetadata
    );

    const processedFiles = {} as Record<ResolutionNames, BucketObject>;

    // Upload processed files
    for (const [resolution, filePath] of Object.entries(generatedPaths) as [ResolutionNames, string][]) {
      const objKey = `processed/${uuid()}-${path.basename(filePath)}`;
      const { etag } = await minioClient.fPutObject(BUCKET_NAMES.damvideos, objKey, filePath, objMetadata);

      processedFiles[resolution] = {
        bucketName: BUCKET_NAMES.damvideos,
        objectKey: objKey,
        etag,
      };
    }

    await VideoService.updateAsset(userId, assetId, ASSET_FILE_STATUS.ready as AssetFileStatus, {
      metadata: videoMetadata,
      storage: {
        thumbnailPreviewFile: {
          bucketName: BUCKET_NAMES.damvideos,
          objectKey: previewObjKey,
          etag: etagPreview,
        },
        processedFiles,
      },
    });
  } catch (error) {
    await VideoService.updateAsset(userId, assetId, ASSET_FILE_STATUS.failed as AssetFileStatus);
    console.error(`Error processing video: ${filePath}`, error);
    throw error;
  }
}

const getVideoMetadata = async (filePath: string): Promise<FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
};

const toVideoMetadata = (
  ext: string,
  ctime: Date,
  mtime: Date,
  jobData: QueueData,
  metadata: FfprobeData
): VideoMetadata => {
  const videoStream = metadata.streams.find((s) => s.codec_type === "video");
  return {
    fileName: jobData.originalName,
    fileSize: jobData.fileSize,
    fileType: ext,
    dateCreated: ctime,
    dateModified: mtime,
    mimeType: jobData.mimeType,
    extension: ext,
    duration: metadata.format.duration,
    fps: eval(videoStream?.r_frame_rate || "0"),
    width: videoStream?.width,
    height: videoStream?.height,
    codec: videoStream?.codec_name,
    bitrate: metadata.format.bit_rate,
    aspectRatio: videoStream?.display_aspect_ratio,
    audioChannels: metadata.streams.find((s) => s.codec_type === "audio")?.channels,
    subtitleTracks: metadata.streams.filter((s) => s.codec_type === "subtitle").map((s) => s.tags?.language || "nil"),
    containerFormat: metadata.format.format_name,
  };
};
