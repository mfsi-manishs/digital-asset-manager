/**
 * @file env.ts
 * @description Environment variables
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") }); // or use this: path.resolve(getLocalDirPath(import.meta.url), "../../../.env");

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.HOST || "http://localhost",
  port: Number(process.env.PORT || 5000),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  cookieSecret: required("COOKIE_SECRET"),
  smtpHost: required("SMTP_HOST"),
  smtpPort: Number(required("SMTP_PORT")),
  smtpUser: required("SMTP_USER"),
  smtpPass: required("SMTP_PASS"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  accessTokenTTL: process.env.ACCESS_TOKEN_TTL || "5m",
  refreshTokenTTL: process.env.REFRESH_TOKEN_TTL || "1d",

  services: {
    imageServiceApiKey: process.env.IMAGE_SERVICE_API_KEY,
    videoServiceApiKey: process.env.VIDEO_SERVICE_API_KEY,
  },

  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: required("DB_USER"),
    password: required("DB_PASS"),
    database: required("DB_NAME"),
    dialect: "postgres" as const,
    logging: process.env.DB_LOGGING === "true",
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },

  minio: {
    host: process.env.MINIO_HOST || "localhost",
    port: Number(process.env.MINIO_PORT) || 9000,
    username: required("MINIO_ROOT_USER"),
    password: required("MINIO_ROOT_PASSWORD"),
  },
};

/**
 * Returns the value of the environment variable specified by `key`.
 * If the value does not exist, it throws an error.
 * @param {string} key - The name of the environment variable to retrieve
 * @returns {string} The value of the environment variable
 * @throws {Error} If the environment variable does not exist
 */
function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    const msg = `Missing environment variable: ${key}`;
    console.error(msg);
    throw new Error(msg);
  }
  return value;
}
