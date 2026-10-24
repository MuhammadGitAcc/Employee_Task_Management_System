import { compare, hash } from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import type {
  UserCreateInput,
  UserUpdateInput,
} from "../schemas/user.schemas.js";
import { HttpError } from "../utils/httpError.js";
import { hasErrorCode } from "../utils/prismaErrors.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  jobTitle: true,
  department: true,
  createdAt: true,
  updatedAt: true,
} as const;

const EMAIL_TAKEN = "Another employee already uses this email.";

const emailTakenError = () =>
  new HttpError(409, EMAIL_TAKEN, { email: EMAIL_TAKEN });

export const listUsers = () =>
  prisma.user.findMany({
    where: { active: true },
    select: userSelect,
    orderBy: { name: "asc" },
  });

export const createUser = async ({ password, ...data }: UserCreateInput) => {
  const passwordHash = await hash(password, 10);

  try {
    return await prisma.user.create({
      data: { ...data, passwordHash },
      select: userSelect,
    });
  } catch (error) {
    if (hasErrorCode(error, "P2002")) {
      throw emailTakenError();
    }
    throw error;
  }
};

export const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { passwordHash: true },
  });
  const matches = user
    ? await compare(currentPassword, user.passwordHash)
    : false;

  if (!user || !matches) {
    throw new HttpError(400, "Current password is incorrect.", {
      currentPassword: "Current password is incorrect.",
    });
  }

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await hash(newPassword, 10) },
  });
};

export const updateUser = async (id: string, data: UserUpdateInput) => {
  try {
    return await prisma.user.update({
      where: { id, active: true },
      data,
      select: userSelect,
    });
  } catch (error) {
    if (hasErrorCode(error, "P2025")) {
      throw new HttpError(404, "Employee not found");
    }
    if (hasErrorCode(error, "P2002")) {
      throw emailTakenError();
    }
    throw error;
  }
};

export const deactivateUser = async (id: string, actorId: string) => {
  if (id === actorId) {
    throw new HttpError(400, "You cannot remove your own account.");
  }

  try {
    await prisma.$transaction([
      prisma.task.updateMany({
        where: { assigneeId: id },
        data: { assigneeId: null },
      }),
      prisma.user.update({
        where: { id, active: true },
        data: { active: false },
      }),
    ]);
  } catch (error) {
    if (hasErrorCode(error, "P2025")) {
      throw new HttpError(404, "Employee not found");
    }
    throw error;
  }
};

export const resetPassword = async (id: string, newPassword: string) => {
  const passwordHash = await hash(newPassword, 10);

  try {
    await prisma.user.update({
      where: { id, active: true },
      data: { passwordHash },
    });
  } catch (error) {
    if (hasErrorCode(error, "P2025")) {
      throw new HttpError(404, "Employee not found");
    }
    throw error;
  }
};
