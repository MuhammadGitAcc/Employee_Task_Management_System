import type { RequestHandler } from "express";
import type { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { verifyToken } from "../utils/jwt.js";

const BEARER_PREFIX = "Bearer ";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith(BEARER_PREFIX)) {
    next(new HttpError(401, "Authentication required"));
    return;
  }

  const userId = await verifyToken(header.slice(BEARER_PREFIX.length));
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
        },
      })
    : null;

  if (!user || !user.active) {
    next(new HttpError(401, "Invalid or expired token"));
    return;
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  next();
};

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, "You do not have permission to do this"));
      return;
    }

    next();
  };
