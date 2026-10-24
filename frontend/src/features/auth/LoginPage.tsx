import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import PageHeader from "~/components/layout/PageHeader";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import Input from "~/components/ui/Input";
import { ApiError } from "~/services/api";
import { env } from "~/utils/env";
import { useAuth } from "./useAuth";

interface LoginLocationState {
  from?: string;
}

const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const from = (location.state as LoginLocationState | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect email or password.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Try again.");
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
            Log in
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />
            {error && (
              <p
                role="alert"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            No account yet?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
