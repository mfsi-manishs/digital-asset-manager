/**
 * @file redis.config.ts
 * @fileoverview This file contains the redis configuration
 */

import { type RedisOptions } from "ioredis";
import { env } from "../../../env.js";

export const redisConnection: RedisOptions = {
  host: env.redis.host,
  port: env.redis.port,
};
