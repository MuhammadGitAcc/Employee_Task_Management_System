import React, { useId } from "react";
import FormField from "./FormField";
import { errorIdFor, fieldClasses } from "./fieldHelpers";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = "",
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField id={inputId} label={label} error={error}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorIdFor(inputId) : undefined}
        className={`${fieldClasses(Boolean(error))} ${className}`.trim()}
        {...props}
      />
    </FormField>
  );
};

export default Input;
