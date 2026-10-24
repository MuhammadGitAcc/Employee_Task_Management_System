import { z } from "zod";

export const ROLES = ["Admin", "Manager", "Employee"] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userCreateSchema = z.object({
  name: z
    .string("Name is required.")
    .trim()
    .min(1, "Name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must be 60 characters or fewer."),
  email: z
    .string("Email is required.")
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .regex(EMAIL_PATTERN, "Enter a valid email address.")
    .max(100, "Email must be 100 characters or fewer."),
  jobTitle: z
    .string("Job title is required.")
    .trim()
    .min(1, "Job title is required.")
    .max(60, "Job title must be 60 characters or fewer."),
  department: z
    .string("Department must be text.")
    .trim()
    .max(60, "Department must be 60 characters or fewer."),
  role: z.enum(ROLES, "Role must be Admin, Manager or Employee."),
  password: z
    .string("Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export const userUpdateSchema = userCreateSchema.omit({ password: true });

export const registerSchema = userCreateSchema.pick({
  name: true,
  email: true,
  password: true,
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string("Current password is required.")
    .min(1, "Current password is required."),
  newPassword: z
    .string("New password is required.")
    .min(8, "New password must be at least 8 characters.")
    .max(72, "New password must be 72 characters or fewer."),
});

export const resetPasswordSchema = changePasswordSchema.pick({
  newPassword: true,
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
