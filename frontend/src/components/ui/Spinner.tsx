import React from "react";

interface SpinnerProps {
  label?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  label = "Loading",
  className = "",
}) => {
  return (
    <span role="status" className="inline-flex items-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className={`h-4 w-4 animate-spin text-primary-600 dark:text-primary-400 ${className}`.trim()}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default Spinner;
