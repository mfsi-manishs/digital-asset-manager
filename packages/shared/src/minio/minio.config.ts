/**
 * @file minio.config.ts
 * @fileoverview This file contains the minio configuration
 */

import { Client } from "minio";
import { getEnv } from "../shared.env.js";

export const minioClient = new Client({
  endPoint: getEnv().minio.host || "localhost",
  port: getEnv().minio.port || 9000,
  useSSL: false,
  accessKey: getEnv().minio.username || "admin",
  secretKey: getEnv().minio.password || "password123",
});

/**
 * Ensures that a given MinIO bucket exists.
 * If the bucket does not exist, it will be created with the given name in the "ap-south-1" region.
 * @param {string} bucketName - The name of the bucket to ensure
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 */
export async function ensureBucket(bucketName: string) {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "ap-south-1");
  }
}

/**
 * Initializes a list of MinIO buckets by ensuring each one exists.
 * If a bucket does not exist, it will be created with the given name in the "ap-south-1" region.
 * @param {string[]} bucketNames - The list of bucket names to initialize
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 */
export async function initBuckets(bucketNames: string[]) {
  for (const bucketName of bucketNames) {
    await ensureBucket(bucketName);
  }
}

export const BUCKET_NAMES = {
  damimages: "damimages",
  damvideos: "damvideos",
};

export type BucketName = keyof typeof BUCKET_NAMES;

initBuckets(Object.values(BUCKET_NAMES));
