/**
 * @file videoProcessing.worker.ts
 * @fileoverview This file contains the video processing worker
 */

import { getEnv, getLocalDirPath, redisConnection, VIDEO_QUEUE_NAME } from "@digital-asset-manager/shared";
import { Job, Worker, type ConnectionOptions } from "bullmq";
import path from "path";
import { pathToFileURL } from "url";

console.log("Starting video worker...");

// Point to the COMPILED .js file in dist/build folder
const videoProcessorPath = path.join(getLocalDirPath(import.meta.url), "video.processor.js");
const videoProcessorUrl = pathToFileURL(videoProcessorPath);

console.log(`Video processor script's URL: ${videoProcessorUrl}`);

const processor =
  getEnv().nodeEnv !== "production"
    ? async (job: Job) => {
        const processorModule = await import("./video.processor.js");
        return processorModule.default(job);
      }
    : videoProcessorUrl;

const videoWorker = new Worker(VIDEO_QUEUE_NAME, processor, {
  connection: redisConnection as ConnectionOptions,
  lockDuration: 300000, // 300 seconds
  stalledInterval: 30000, // Check for stalled jobs every 30 seconds
  concurrency: 4, // How many child processes to run at once
  useWorkerThreads: true, // Recommended for better performance in Node.js
});

videoWorker.on("active", () => {
  console.log("Video worker is active");
});

videoWorker.on("progress", (job) => {
  console.log(`Video job ${job.id} in progress: ${job?.progress}%`);
});

videoWorker.on("failed", (job, err) => {
  console.error(`Video job ${job?.id} failed: ${err.message}`);
});

videoWorker.on("completed", (job) => {
  console.log(`Video job ${job.id} completed`);
});
