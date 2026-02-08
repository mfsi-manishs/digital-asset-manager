/**
 * @file zod-to-openapi.config.ts
 * @fileoverview This file contains the zod-to-openapi configuration. It extends zod with openapi methods.
 */

import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extend zod with openapi methods.
extendZodWithOpenApi(z);
