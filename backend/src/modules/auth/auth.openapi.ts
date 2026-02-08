import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { registerReqBodySchema } from "./auth.schema.js";

export const authRegistry = new OpenAPIRegistry();

// Schemas
authRegistry.register("registerReqBodySchema", registerReqBodySchema);

// Paths
authRegistry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Request password reset",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerReqBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Password reset email sent",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string", example: "1234567890" },
              name: { type: "string", example: "John Doe" },
              email: { type: "string", example: "john@example.com" },
              role: { type: "string", example: "user" },
              isEmailVerified: { type: "boolean", example: true },
              preferredCurrency: { type: "string", example: "USD" },
              createdAt: { type: "string", example: "2022-01-01T00:00:00.000Z" },
              updatedAt: { type: "string", example: "2022-01-01T00:00:00.000Z" },
            },
          },
        },
      },
    },
  },
});
