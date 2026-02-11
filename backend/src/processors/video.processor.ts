/**
 * @file video.processor.ts
 * @fileoverview This file contains the video processor
 */

import type { Job } from "bullmq";
import fs from "fs";
import path from "path";

export default async function (job: Job) {
  const { filePath } = job.data;
  console.log(`Processing video: ${filePath}`);

  // Example: check file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // TODO: Add actual video processing logic (e.g., ffmpeg transcoding)

  const outputPath = path.join(path.dirname(filePath), "processed-" + path.basename(filePath));

  // For demo, just copy file
  fs.copyFileSync(filePath, outputPath);

  return { outputPath };
}
