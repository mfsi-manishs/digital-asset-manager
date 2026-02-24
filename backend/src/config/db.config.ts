/**
 * @file db.config.ts
 * @fileoverview This file contains the database configuration
 */

import pg from "pg";
import { Sequelize } from "sequelize";
import { env } from "../env.js";

// Force BIGINT (OID 20) to be parsed as a Number. This must run before any queries are executed
// JavaScript’s Number type has a maximum safe integer value of 2^53-1 (9,007,199,254,740,991). A PostgreSQL BIGINT can store up to 2^63-1
// To prevent data loss or precision errors for extremely large numbers (like file sizes in bytes for a Digital Asset Manager),
// the pg driver returns BIGINT values as strings by default.
pg.types.setTypeParser(20, (val: string) => {
  return parseInt(val, 10);
});

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
