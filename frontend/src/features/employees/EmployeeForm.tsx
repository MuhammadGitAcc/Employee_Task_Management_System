import React, { useState } from "react";
import Button from "~/components/ui/Button";
import Input from "~/components/ui/Input";
import Select from "~/components/ui/Select";
import { ApiError } from "~/services/api";
import type { Role } from "~/types/auth.types";
import type { EmployeeInput } from "./employee.types";
import { validateEmployee } from "./employee.validation";
import type { EmployeeFormErrors } from "./employee.validation";

const ROLES: Role[] = ["Admin", "Manager", "Employee"];

interface EmployeeFormProps {
  onSubmit: (employee: EmployeeInput, password: string) => Promise<void>;
  existingEmails: string[];
  initialData?: EmployeeInput;
  requirePassword?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSubmit,
  existingEmails,
  initialData,
  requirePassword = false,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState<Role>(initialData?.role || "Employee");
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: keyof EmployeeFormErrors) => {
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateEmployee(
      { name, email, role, jobTitle, department, password },
      existingEmails,
      requirePassword
    );
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setFormError("");
    setSubmitting(true);
    try {
      await onSubmit(
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          jobTitle: jobTitle.trim(),
          department: department.trim(),
        },
        password
      );
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setErrors(error.details as EmployeeFormErrors);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Name"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          clearError("name");
        }}
        error={errors.name}
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          clearError("email");
        }}
        error={errors.email}
        required
      />
      <Select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        error={errors.role}
      >
        {ROLES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Input
        label="Job Title"
        type="text"
        value={jobTitle}
        onChange={(e) => {
          setJobTitle(e.target.value);
          clearError("jobTitle");
        }}
        error={errors.jobTitle}
        required
      />
      <Input
        label="Department"
        type="text"
        value={department}
        onChange={(e) => {
          setDepartment(e.target.value);
          clearError("department");
        }}
        error={errors.department}
      />
      {requirePassword && (
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
          error={errors.password}
          required
        />
      )}
      {formError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save Employee"}
      </Button>
    </form>
  );
};

export default EmployeeForm;
