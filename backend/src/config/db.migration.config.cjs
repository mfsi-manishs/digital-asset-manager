/**
 * @file db.migration.config.ts
 * @fileoverview This file contains the database configuration
 */

import { env } from "../env.js";

export default {
  development: {
    username: env.db.username,
    password: env.db.password,
    database: env.db.database,
    host: env.db.host,
    dialect: "postgres",
  },
  test: {
    username: env.db.username,
    password: env.db.password,
    database: env.db.database,
    host: env.db.host,
    dialect: "postgres",
  },
  production: {
    username: env.db.username,
    password: env.db.password,
    database: env.db.database,
    host: env.db.host,
    dialect: "postgres",
    logging: false,
  },
};
