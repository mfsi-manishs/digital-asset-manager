/**
 * @file videoQueue.service.ts
 * @fileoverview This file contains the video queue service
 */

import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.config.js";

export const VIDEO_QUEUE_NAME = "videoQueue";

export const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
  connection: redisConnection,
});
