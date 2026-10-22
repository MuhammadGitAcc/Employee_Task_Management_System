import React from "react";

type PageSize = "wide" | "narrow";

interface PageContainerProps {
  size?: PageSize;
  children: React.ReactNode;
}

const sizeClasses: Record<PageSize, string> = {
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
};

const PageContainer: React.FC<PageContainerProps> = ({
  size = "wide",
  children,
}) => {
  return (
    <div className={`${sizeClasses[size]} mx-auto px-6 py-8`}>{children}</div>
  );
};

export default PageContainer;
