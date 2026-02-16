/**
 * @file video.processor.ts
 * @fileoverview This file contains the video processor
 */

import type { Job } from "bullmq";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import ffmpeg, { type FfprobeData } from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { AssetService } from "../modules/asset/asset.service.js";
import type { ObjectMetadata, QueueData } from "../modules/asset/asset.types.js";
import { BUCKET_NAMES, ensureBucket, minioClient } from "../packages/shared/minio/minio.config.js";
import type { BucketObject, ResolutionNames, VideoMetadata } from "../packages/shared/types/asset.type.js";
import { VideoUtils } from "../utils/video.utils.js";

ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
ffmpeg.setFfprobePath(ffprobePath.path);

export default async function videoProcessor(job: Job<QueueData>) {
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

    // Upload original file to MinIO
    const { etag: etagOriginal } = await minioClient.fPutObject(
      BUCKET_NAMES.damvideos,
      filePath,
      filePath,
      objMetadata
    );

    // Upload thumbnail file to MinIO
    const { etag: etagPreview } = await minioClient.fPutObject(
      BUCKET_NAMES.damvideos,
      previewPath,
      previewPath,
      objMetadata
    );

    const processedFiles = {} as Record<ResolutionNames, BucketObject>;

    // Upload processed files
    for (const [resolution, filePath] of Object.entries(generatedPaths) as [ResolutionNames, string][]) {
      const { etag } = await minioClient.fPutObject(BUCKET_NAMES.damvideos, filePath, filePath, objMetadata);

      processedFiles[resolution] = {
        bucketName: BUCKET_NAMES.damvideos,
        objectKey: filePath,
        etag,
      };
    }

    // Update asset in database
    await AssetService.update(userId, assetId, {
      status: "ready",
      metadata: videoMetadata,
      storage: {
        originalFile: {
          bucketName: BUCKET_NAMES.damvideos,
          objectKey: filePath,
          etag: etagOriginal,
        },
        thumbnailPreviewFile: {
          bucketName: BUCKET_NAMES.damvideos,
          objectKey: previewPath,
          etag: etagPreview,
        },
        processedFiles,
      },
    });
  } catch (error) {
    await AssetService.update(userId, assetId, { status: "failed" });
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
    filePath: jobData.filePath,
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
