import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./employee.validation";

export interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

export type ResetPasswordErrors = Partial<
  Record<keyof ResetPasswordValues, string>
>;

export const validateResetPassword = (
  values: ResetPasswordValues
): ResetPasswordErrors => {
  const errors: ResetPasswordErrors = {};

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `New password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  } else if (values.newPassword.length > PASSWORD_MAX_LENGTH) {
    errors.newPassword = `New password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm the new password.";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};
