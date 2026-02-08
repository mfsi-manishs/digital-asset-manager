/**
 * @file user.route.ts
 * @fileoverview This file contains the user routes
 */

import express from "express";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { UserController } from "./user.controller.js";
import { updateUserReqBodySchema, userByIdReqParamsSchema, userEmailReqQParamsSchema } from "./user.schema.js";

/**
 * User routes
 * @returns {Router} Express router with user routes
 */
export default function userRoutes() {
  const router = express.Router();

  router.get("/all", UserController.getAllUsers);
  router.get("/email", validateRequest({ query: userEmailReqQParamsSchema }), UserController.getUserByEmail);
  router.get("/:id", validateRequest({ params: userByIdReqParamsSchema }), UserController.getUserById);
  router.patch(
    "/:id",
    validateRequest({ params: userByIdReqParamsSchema, body: updateUserReqBodySchema }),
    UserController.updateUserById
  );

  return router;
}
