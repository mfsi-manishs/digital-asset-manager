/**
 * @file image.processor.ts
 * @fileoverview This file contains the image processor
 */

import type { Job } from "bullmq";
import fs from "fs";
import path from "path";

export default async function imageProcessor(job: Job) {
  const { filePath } = job.data;
  console.log(`Processing image: ${filePath}`);

  // Example: check file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // TODO: Add actual image processing logic (e.g., resize, compress)

  const outputPath = path.join(path.dirname(filePath), "processed-" + path.basename(filePath));

  // For demo, just copy file
  fs.copyFileSync(filePath, outputPath);

  return { outputPath };
}
