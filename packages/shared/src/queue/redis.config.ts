/**
 * @file redis.config.ts
 * @fileoverview This file contains the redis configuration
 */

import { type RedisOptions } from "ioredis";
import { getEnv } from "../shared.env.js";

export const redisConnection: RedisOptions = {
  host: getEnv().redis.host,
  port: getEnv().redis.port,
};
