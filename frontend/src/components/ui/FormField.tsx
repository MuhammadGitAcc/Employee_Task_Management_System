import React from "react";
import { errorIdFor } from "./fieldHelpers";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  error,
  children,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={errorIdFor(id)}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
