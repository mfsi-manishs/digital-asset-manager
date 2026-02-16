/**
 * @file db.migration.config.ts
 * @fileoverview This file contains the database configuration
 */

import { getEnv } from "../shared.env.js";

export default {
  development: {
    username: getEnv().db.username,
    password: getEnv().db.password,
    database: getEnv().db.database,
    host: getEnv().db.host,
    dialect: "postgres",
  },
  test: {
    username: getEnv().db.username,
    password: getEnv().db.password,
    database: getEnv().db.database,
    host: getEnv().db.host,
    dialect: "postgres",
  },
  production: {
    username: getEnv().db.username,
    password: getEnv().db.password,
    database: getEnv().db.database,
    host: getEnv().db.host,
    dialect: "postgres",
    logging: false,
  },
};
