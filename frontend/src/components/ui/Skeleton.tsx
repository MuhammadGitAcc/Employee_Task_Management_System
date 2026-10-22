import React from "react";

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`.trim()}
    />
  );
};

export default Skeleton;
