/**
 * @file file.utils.ts
 * @fileoverview This file contains the file utils
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

/**
 * Provides CommonJS-like __filename and __dirname in ESM modules.
 * Works in both dev (ts-node/tsx) and production (compiled JS).
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export { __dirname, __filename };

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
