/**
 * @file server.ts
 * @fileoverview This file contains the server
 */

import app from "./app.js";
import { env } from "./env.js";
import { sequelize } from "./models/index.model.js";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}...`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
