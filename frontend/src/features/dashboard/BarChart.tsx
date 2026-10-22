import React from "react";
import Card from "~/components/ui/Card";
import type { ChartDatum } from "./dashboard.charts";

interface BarChartProps {
  title: string;
  data: ChartDatum[];
  emptyText?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  emptyText = "No data yet.",
}) => {
  const max = Math.max(0, ...data.map((item) => item.value));

  return (
    <Card as="section">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">
        {title}
      </h2>
      {max > 0 ? (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.label}>
              <div className="flex justify-between text-sm text-gray-600 mb-1 dark:text-gray-300">
                <span>{item.label}</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {item.value}
                </span>
              </div>
              <div
                className="h-2 bg-gray-100 rounded-full dark:bg-gray-700"
                aria-hidden="true"
              >
                <div
                  className={`h-2 rounded-full ${item.barClass}`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>
      )}
    </Card>
  );
};

export default BarChart;
