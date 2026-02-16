/**
 * @file db.config.ts
 * @fileoverview This file contains the database configuration
 */

import { Sequelize } from "sequelize";
import { getEnv } from "../shared.env.js";

// Initialize Sequelize and use it to connect to the database
export const sequelize = new Sequelize(getEnv().db.database, getEnv().db.username, getEnv().db.password, {
  host: getEnv().db.host,
  port: getEnv().db.port,
  dialect: getEnv().db.dialect,
  logging: getEnv().db.logging ? console.log : false,
  pool: {
    max: 10, // max connections
    min: 0, // min connections
    acquire: 30000, // max time (ms) to try getting connection
    idle: 10000, // max time (ms) a connection can be idle
  },
  timezone: "+00:00",
  dialectOptions: {
    ssl: getEnv().nodeEnv === "production" ? { require: true, rejectUnauthorized: false } : false,
    useUTC: true,
  },
});
