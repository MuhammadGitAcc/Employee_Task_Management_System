import React, { useId } from "react";
import FormField from "./FormField";
import { errorIdFor, fieldClasses } from "./fieldHelpers";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  id,
  className = "",
  ...props
}) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <FormField id={textareaId} label={label} error={error}>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorIdFor(textareaId) : undefined}
        className={`${fieldClasses(Boolean(error))} ${className}`.trim()}
        {...props}
      />
    </FormField>
  );
};

export default Textarea;
