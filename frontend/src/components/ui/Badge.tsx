import React from "react";

export type BadgeTone = "gray" | "yellow" | "blue" | "green" | "red";

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const Badge: React.FC<BadgeProps> = ({ tone = "gray", children }) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
