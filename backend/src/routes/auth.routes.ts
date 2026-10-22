import { compare, hashSync } from "bcryptjs";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.middleware.js";
import type { AuthUser } from "../types/auth.types.js";
import { HttpError } from "../utils/httpError.js";
import { signToken } from "../utils/jwt.js";

export const authRouter = Router();

const DUMMY_HASH = hashSync("not-a-real-password", 10);

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    throw new HttpError(400, "Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  const passwordMatches = await compare(
    password,
    user?.passwordHash ?? DUMMY_HASH,
  );

  if (!user || !passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.json({ token: await signToken(authUser), user: authUser });
});

authRouter.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});
