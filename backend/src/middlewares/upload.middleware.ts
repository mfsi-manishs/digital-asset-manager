/**
 * @file upload.middleware.ts
 * @fileoverview This file contains the upload middleware.
 */
import multer from "multer";
import path from "path";
import { __dirname } from "../utils/file.utils.js";
import fs from "fs";

export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 1; // 1GB
export const FILE_FORM_FIELD_NAME = "files";

// Resolve uploads directory path and ensure it exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * @constant storage
 * @description Multer storage configuration to store files on the local file system.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

/**
 * @constant uploadMultiple
 * @description Multer instance method for generating middleware that process multiple files uploaded in multipart/form-data format.
 */
export const uploadMultiple = multer({ storage: storage }).array(FILE_FORM_FIELD_NAME, MAX_FILES);
