import type { NewEmployeeInput } from "./employee.types";

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 60;
export const EMAIL_MAX_LENGTH = 100;
export const JOB_TITLE_MAX_LENGTH = 60;
export const DEPARTMENT_MAX_LENGTH = 60;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export type EmployeeFormErrors = Partial<
  Record<keyof NewEmployeeInput, string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmployee = (
  values: NewEmployeeInput,
  otherEmails: string[],
  requirePassword = false
): EmployeeFormErrors => {
  const errors: EmployeeFormErrors = {};
  const name = values.name.trim();
  const email = values.email.trim().toLowerCase();
  const jobTitle = values.jobTitle.trim();
  const department = values.department.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length < NAME_MIN_LENGTH) {
    errors.name = `Name must be at least ${NAME_MIN_LENGTH} characters.`;
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = `Email must be ${EMAIL_MAX_LENGTH} characters or fewer.`;
  } else if (
    otherEmails.some((other) => other.trim().toLowerCase() === email)
  ) {
    errors.email = "Another employee already uses this email.";
  }

  if (!jobTitle) {
    errors.jobTitle = "Job title is required.";
  } else if (jobTitle.length > JOB_TITLE_MAX_LENGTH) {
    errors.jobTitle = `Job title must be ${JOB_TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (department.length > DEPARTMENT_MAX_LENGTH) {
    errors.department = `Department must be ${DEPARTMENT_MAX_LENGTH} characters or fewer.`;
  }

  if (requirePassword) {
    if (!values.password) {
      errors.password = "Password is required.";
    } else if (values.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    } else if (values.password.length > PASSWORD_MAX_LENGTH) {
      errors.password = `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
    }
  }

  return errors;
};
