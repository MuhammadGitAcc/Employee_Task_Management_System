import React, { useId } from "react";
import FormField from "./FormField";
import { errorIdFor, fieldClasses } from "./fieldHelpers";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  id,
  className = "",
  children,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FormField id={selectId} label={label} error={error}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorIdFor(selectId) : undefined}
        className={`${fieldClasses(Boolean(error))} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
};

export default Select;
