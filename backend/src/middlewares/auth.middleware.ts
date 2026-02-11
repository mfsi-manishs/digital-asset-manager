/**
 * @file auth.middleware.ts
 * @fileoverview This file contains the authentication middleware
 */

import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.utils.js";

/**
 * Authenticate the request using the provided access token
 * If the token is invalid, an HTTP 401 status code will be returned
 * If the token is valid, the user will be attached to the request object
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Next function to call
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  try {
    const token = header.split(" ")[1];
    if (!token) return res.sendStatus(401);
    const payload = await verifyAccessToken(token);

    req.user = {
      id: Number(payload.sub),
      role: payload.role,
    };

    return next();
  } catch {
    res.sendStatus(401);
  }
};
