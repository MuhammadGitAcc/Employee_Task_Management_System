import { vi } from "vitest";

export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  task: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  taskComment: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  taskActivity: {
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
  },
  chatMessage: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};
