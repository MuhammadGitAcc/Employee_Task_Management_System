import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "~/features/employees/employee.validation";

export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ChangePasswordErrors = Partial<
  Record<keyof ChangePasswordValues, string>
>;

export const validateChangePassword = (
  values: ChangePasswordValues
): ChangePasswordErrors => {
  const errors: ChangePasswordErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `New password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  } else if (values.newPassword.length > PASSWORD_MAX_LENGTH) {
    errors.newPassword = `New password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword =
      "New password must be different from the current password.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};
