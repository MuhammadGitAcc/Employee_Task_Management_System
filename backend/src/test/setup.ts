import { beforeEach, vi } from "vitest";
import { prismaMock } from "./prismaMock.js";

vi.mock("../lib/prisma.js", async () => {
  const { prismaMock: mock } = await import("./prismaMock.js");
  return { prisma: mock };
});

beforeEach(() => {
  vi.resetAllMocks();
  prismaMock.$transaction.mockImplementation((operations: unknown[]) =>
    Promise.all(operations),
  );
});
