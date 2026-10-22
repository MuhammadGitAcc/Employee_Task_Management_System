import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseClasses =
  "inline-flex justify-center items-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500",
  secondary:
    "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
  danger:
    "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    />
  );
};

export default Button;
