/**
 * @file file.utils.ts
 * @fileoverview This file contains the file utils
 */

import fs from "fs";
import { fileURLToPath } from "url";

/**
 * Provides CommonJS-like __filename and __dirname in ESM modules.
 * Works in both dev (ts-node/tsx) and production (compiled JS).
 */

/**
 * Returns the local file path for a given import.meta.url.
 * This function is useful for migrating CommonJS code to ESM modules.
 * @param {string} importMetaUrl The import.meta.url to convert to a local file path.
 * @returns {string} The local file path.
 */
export function getLocalFilePath(importMetaUrl: string) {
  return fileURLToPath(importMetaUrl);
}

/**
 * Returns the local directory path for a given import.meta.url.
 * This function is useful for migrating CommonJS code to ESM modules.
 * @param {string} importMetaUrl The import.meta.url to convert to a local directory path.
 * @returns {string} The local directory path.
 */
export function getLocalDirPath(importMetaUrl: string) {
  return getLocalFilePath(importMetaUrl);
}

/**
 * Ensures that a directory exists at the given path.
 * If the directory does not exist, it will be created recursively.
 * @param {string} dirPath - The path of the directory to ensure.
 * @returns {string} The path of the ensured directory.
 */
export function ensureDirExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}
