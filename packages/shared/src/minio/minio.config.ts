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

/**
 * Retrieves the object info of a given object in a MinIO bucket.
 * If the object does not exist, the function will return null.
 * @param {string} bucketName - The name of the bucket where the object is located.
 * @param {string} objectKey - The key of the object to retrieve.
 * @returns {Promise<Stat | null>} - A promise that resolves to the object info if the object exists, or null if it does not.
 */
export async function getObjectInfo(bucketName: string, objectKey: string) {
  try {
    const stat = await minioClient.statObject(bucketName, objectKey);
    return stat;
  } catch (err: unknown) {
    // Specifically check for 'NotFound' or 'NoSuchKey' errors
    if (err instanceof Error && "code" in err && (err.code === "NotFound" || err.code === "NoSuchKey")) {
      return null;
    }
    throw err;
  }
}

/**
 * Downloads an object from MinIO to a specific local path.
 * @param {string} bucketName - Your MinIO bucket name.
 * @param {string} objectKey - The key/path of the file in MinIO.
 * @param {string} destinationPath - Where to save the file on your disk.
 */
export async function downloadToLocal(bucketName: string, objectKey: string, destinationPath: string) {
  try {
    await minioClient.fGetObject(bucketName, objectKey, destinationPath);
    console.log(`Successfully downloaded ${objectKey} to ${destinationPath}`);
    return true;
  } catch (err) {
    // Specifically check for 'NotFound' or 'NoSuchKey' errors
    if (err instanceof Error && "code" in err && (err.code === "NotFound" || err.code === "NoSuchKey")) {
      return false;
    }
    throw err;
  }
}

export const BUCKET_NAMES = {
  damimages: "damimages",
  damvideos: "damvideos",
};

export type BucketName = keyof typeof BUCKET_NAMES;

initBuckets(Object.values(BUCKET_NAMES));
