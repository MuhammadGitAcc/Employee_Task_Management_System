import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageHeader from "~/components/layout/PageHeader";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import Input from "~/components/ui/Input";
import { ApiError, getErrorMessage } from "~/services/api";
import { env } from "~/utils/env";
import { validateSignUp } from "./signup.validation";
import type { SignUpErrors, SignUpValues } from "./signup.validation";
import { useAuth } from "./useAuth";

const SignUpPage: React.FC = () => {
  const { user, register } = useAuth();
  const [values, setValues] = useState<SignUpValues>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange =
    (field: keyof SignUpValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: e.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setFormError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateSignUp(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await register(values.name, values.email, values.password);
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(err.details as SignUpErrors);
      } else {
        setFormError(getErrorMessage(err));
      }
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <PageHeader title={env.appName} />
        <Card>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-100">
            Create your account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={handleChange("name")}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              value={values.email}
              onChange={handleChange("email")}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange("password")}
              error={errors.password}
            />
            {formError && (
              <p
                role="alert"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {formError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
};

export default SignUpPage;
