import { Worker } from "bullmq";
import path from "path";
import { pathToFileURL } from "url";
import { redisConnection } from "../config/redis.config.js";
import { VIDEO_QUEUE_NAME } from "../services/videoQueue.service.js";
import { __dirname } from "../utils/file.utils.js";

console.log("Starting video worker...");

// Point to the COMPILED .js file in dist/build folder
const videoProcessorPath = path.join(__dirname, "../processors/video.processor.js");
const videoProcessorUrl = pathToFileURL(videoProcessorPath);

console.log(`Video processor script's URL: ${videoProcessorUrl}`);

const videoWorker = new Worker(VIDEO_QUEUE_NAME, videoProcessorUrl, {
  // useWorkerThreads: true, // Enables Node.js Worker Threads instead of child processes,
  connection: redisConnection,
});

videoWorker.on("active", () => {
  console.log("Video worker is active");
});

videoWorker.on("progress", (job) => {
  console.log(`Video job ${job.id} in progress...`);
});

videoWorker.on("failed", (job, err) => {
  console.error(`Video job ${job?.id} failed: ${err.message}`);
});

videoWorker.on("completed", (job) => {
  console.log(`Video job ${job.id} completed`);
});
