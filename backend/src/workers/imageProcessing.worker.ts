/**
 * @file imageProcessing.worker.ts
 * @fileoverview This file contains the image processing worker
 */

import { Worker } from "bullmq";
import path from "path";
import { pathToFileURL } from "url";
import { redisConnection } from "../config/redis.config.js";
import { IMAGE_QUEUE_NAME } from "../services/imageQueue.service.js";
import { __dirname } from "../utils/file.utils.js";

console.log("Starting image worker...");

// Point to the COMPILED .js file in dist/build folder
const imageProcessorPath = path.join(__dirname, "../processors/image.processor.js");
const imageProcessorUrl = pathToFileURL(imageProcessorPath);

console.log(`Image processor script's URL: ${imageProcessorUrl}`);

const imageWorker = new Worker(IMAGE_QUEUE_NAME, imageProcessorUrl, {
  connection: redisConnection,
  lockDuration: 300000, // 300 seconds
  stalledInterval: 30000, // Check for stalled jobs every 30 seconds
  concurrency: 4, // How many child processes to run at once
  useWorkerThreads: true, // Recommended for better performance in Node.js
});

imageWorker.on("active", () => {
  console.log("Image worker is active");
});

imageWorker.on("progress", (job) => {
  console.log(`Image job ${job.id} in progress...`);
});

imageWorker.on("failed", (job, err) => {
  console.error(`Image job ${job?.id} failed: ${err.message}`);
});

imageWorker.on("completed", (job) => {
  console.log(`Image job ${job.id} completed`);
});
