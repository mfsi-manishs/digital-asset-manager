/**
 * @file imageQueue.service.ts
 * @fileoverview This file contains the image queue service
 */

import { Queue, type ConnectionOptions } from "bullmq";
import { redisConnection } from "./redis.config.js";

export const IMAGE_QUEUE_NAME = "imageQueue";

export const imageQueue = new Queue(IMAGE_QUEUE_NAME, {
  connection: redisConnection as ConnectionOptions,
});
