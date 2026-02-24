/**
 * @file axios.config.ts
 * @fileoverview This file contains the axios configuration
 */

import { getEnv } from "@digital-asset-manager/shared";
import axios from "axios";

const HOST_URL = `${getEnv().host}:${getEnv().port}`;

const api = axios.create({
  baseURL: `${HOST_URL}/api`,
});

/**
 * Interceptors
 * @description Intercepts requests and adds the access token to the headers
 */
api.interceptors.request.use(
  (config) => {
    config.headers["x-api-key"] = getEnv().services.imageServiceApiKey;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
