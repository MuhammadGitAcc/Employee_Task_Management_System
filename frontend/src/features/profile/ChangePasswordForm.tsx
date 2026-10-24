import React, { useState } from "react";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import Input from "~/components/ui/Input";
import { ApiError, getErrorMessage } from "~/services/api";
import { changePassword } from "~/services/auth";
import { validateChangePassword } from "./password.validation";
import type {
  ChangePasswordErrors,
  ChangePasswordValues,
} from "./password.validation";

const emptyValues: ChangePasswordValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePasswordForm: React.FC = () => {
  const [values, setValues] = useState<ChangePasswordValues>(emptyValues);
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof ChangePasswordValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: e.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setFormError("");
      setSaved(false);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const found = validateChangePassword(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      setValues(emptyValues);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(err.details as ChangePasswordErrors);
      } else {
        setFormError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card as="section" className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">
        Change password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={handleChange("currentPassword")}
          error={errors.currentPassword}
        />
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
        {saved && (
          <p
            role="status"
            className="text-sm text-green-700 dark:text-green-400"
          >
            Password changed.
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Change password"}
        </Button>
      </form>
    </Card>
  );
};

export default ChangePasswordForm;
