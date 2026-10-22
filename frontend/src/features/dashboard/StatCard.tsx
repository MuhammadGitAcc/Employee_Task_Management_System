import React from "react";
import Card from "~/components/ui/Card";

export type StatTone = "gray" | "blue" | "green" | "red";

interface StatCardProps {
  label: string;
  value: number;
  tone?: StatTone;
}

const toneClasses: Record<StatTone, string> = {
  gray: "border-l-gray-300 text-gray-800 dark:border-l-gray-500 dark:text-gray-100",
  blue: "border-l-blue-500 text-blue-700 dark:border-l-blue-500 dark:text-blue-300",
  green:
    "border-l-green-500 text-green-700 dark:border-l-green-500 dark:text-green-300",
  red: "border-l-red-500 text-red-700 dark:border-l-red-500 dark:text-red-300",
};

const StatCard: React.FC<StatCardProps> = ({ label, value, tone = "gray" }) => {
  return (
    <Card className={`border-l-4 ${toneClasses[tone]}`}>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Card>
  );
};

export default StatCard;
