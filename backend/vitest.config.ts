import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      JWT_SECRET: "test-secret-test-secret-test-secret-123",
      JWT_EXPIRES_IN: "1h",
      CORS_ORIGIN: "http://localhost:5173",
    },
  },
});
