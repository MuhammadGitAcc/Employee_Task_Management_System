import React, { useState } from "react";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import { ApiError, getErrorMessage } from "~/services/api";
import { validateResetPassword } from "./resetPassword.validation";
import type {
  ResetPasswordErrors,
  ResetPasswordValues,
} from "./resetPassword.validation";

interface ResetPasswordFormProps {
  employeeName: string;
  onSubmit: (newPassword: string) => Promise<void>;
}

const emptyValues: ResetPasswordValues = {
  newPassword: "",
  confirmPassword: "",
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  employeeName,
  onSubmit,
}) => {
  const [values, setValues] = useState<ResetPasswordValues>(emptyValues);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof ResetPasswordValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: e.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setFormError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateResetPassword(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(values.newPassword);
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(err.details as ResetPasswordErrors);
      } else {
        setFormError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Set a new password for {employeeName}. Share it with them yourself.
      </p>
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        value={values.newPassword}
        onChange={handleChange("newPassword")}
        error={errors.newPassword}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange("confirmPassword")}
        error={errors.confirmPassword}
      />
      {formError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Set new password"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
