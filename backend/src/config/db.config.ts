/**
 * @file db.config.ts
 * @fileoverview This file contains the database configuration
 */

import { Sequelize } from "sequelize";
import { env } from "../env.js";

// Initialize Sequelize and use it to connect to the database
export const sequelize = new Sequelize(env.db.database, env.db.username, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: env.db.dialect,
  logging: env.db.logging ? console.log : false,
  pool: {
    max: 10, // max connections
    min: 0, // min connections
    acquire: 30000, // max time (ms) to try getting connection
    idle: 10000, // max time (ms) a connection can be idle
  },
  timezone: "+00:00",
  dialectOptions: {
    ssl: env.nodeEnv === "production" ? { require: true, rejectUnauthorized: false } : false,
    useUTC: true,
  },
});
