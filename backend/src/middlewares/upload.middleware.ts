/**
 * @file upload.middleware.ts
 * @fileoverview This file contains the upload middleware.
 */
import { ensureDirExists, getLocalDirPath } from "@digital-asset-manager/shared";
import multer from "multer";
import path from "path";

export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 1; // 1GB
export const FILE_FORM_FIELD_NAME = "files";

// Resolve uploads directory path and ensure it exists
const uploadsDir = path.join(getLocalDirPath(import.meta.url), "../../uploads");
ensureDirExists(uploadsDir);
console.log("Uploads directory:", uploadsDir);

/**
 * @constant storage
 * @description Multer storage configuration to store files on the local file system.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(getLocalDirPath(import.meta.url), "../../uploads"));
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
