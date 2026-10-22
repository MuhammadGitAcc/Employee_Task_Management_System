import { jwtVerify, SignJWT } from "jose";
import { env } from "../config/env.js";
import type { AuthUser } from "../types/auth.types.js";

const secret = new TextEncoder().encode(env.jwtSecret);

export const signToken = (user: AuthUser): Promise<string> =>
  new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.jwtExpiresIn)
    .sign(secret);

export const verifyToken = async (token: string): Promise<string | null> => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload.sub ?? null;
  } catch {
    return null;
  }
};
