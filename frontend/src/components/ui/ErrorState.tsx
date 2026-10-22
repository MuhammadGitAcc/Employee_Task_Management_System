import React from "react";

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div
      role="alert"
      className="text-center py-12 px-6 bg-white rounded-lg border border-red-200 dark:bg-gray-800 dark:border-red-900"
    >
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default ErrorState;
