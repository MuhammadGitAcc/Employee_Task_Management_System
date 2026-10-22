import type { Request } from "express";
import type { AuthUser } from "../types/auth.types.js";
import { HttpError } from "./httpError.js";

export const getIdParam = (req: Request): string => {
  const { id } = req.params;

  if (typeof id !== "string" || !id) {
    throw new HttpError(400, "Invalid id");
  }

  return id;
};

export const getRequestUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw new HttpError(401, "Authentication required");
  }

  return req.user;
};
