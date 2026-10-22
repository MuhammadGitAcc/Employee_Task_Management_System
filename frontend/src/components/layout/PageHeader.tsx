import React from "react";

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center dark:text-gray-100">
      {title}
    </h1>
  );
};

export default PageHeader;
