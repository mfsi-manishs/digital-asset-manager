/**
 * @file createApiKeys.ts
 * @fileoverview This file contains the script to create api keys for the image and video services
 */

import { models, sequelize } from "../src/models/index.model.js";
import { generateApiKey, hashApiKey } from "../src/utils/crypto.utils.js";

/**
 * Creates an API key for the given service name.
 * Returns the API key ID, name and the raw API key.
 * The raw API key is only returned once, and is not stored in the database.
 * @param {string} name - The name of the service to create the API key for.
 * @returns {Promise<{id: number, name: string, apiKey: string}>} - The created API key.
 */
export const createApiKey = async (name: string) => {
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);

  const apiKey = await models.ApiKeyModel.create({
    name,
    keyHash,
  });

  return {
    id: apiKey.id,
    name: apiKey.name,
    apiKey: rawKey, // RETURN ONLY ONCE
  };
};

/**
 * Runs the script to create API keys for the image and video services.
 * Authenticates the database connection, creates the API keys, and logs the created API keys to the console.
 * If an error occurs during the execution, it logs the error to the console and exits with a non-zero status code.
 * If no error occurs, it exits with a status code of 0.
 */
const run = async () => {
  try {
    await sequelize.authenticate();

    console.log("Creating API keys...\n");

    const imageKey = await createApiKey("image-service");
    const videoKey = await createApiKey("video-service");

    console.log("Image Service API Key:");
    console.log(imageKey.apiKey);

    console.log("\nVideo Service API Key:");
    console.log(videoKey.apiKey);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
