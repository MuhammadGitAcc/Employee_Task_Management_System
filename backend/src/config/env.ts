import "dotenv/config";

const nodeEnv = process.env.NODE_ENV ?? "development";
const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port,
  databaseUrl,
  jwtSecret,
  jwtExpiresIn,
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
