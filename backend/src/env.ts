/**
 * @file env.ts
 * @description Environment variables
 */

import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.HOST || "http://localhost",
  port: Number(process.env.PORT || 5000),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  cookieSecret: process.env.COOKIE_SECRET || "supersecret",
  smtpHost: process.env.SMTP_HOST!,
  smtpPort: Number(process.env.SMTP_PORT!),
  smtpUser: process.env.SMTP_USER!,
  smtpPass: process.env.SMTP_PASS!,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  accessTokenTTL: "5m",
  refreshTokenTTL: "1d",

  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "password",
    database: process.env.DB_NAME || "finance_tracker",
    dialect: "postgres" as const, // or "mysql" | "mariadb" | "sqlite" | "mssql"
    logging: process.env.DB_LOGGING === "true",
  },
};
