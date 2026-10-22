import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "nav";
}

const Card: React.FC<CardProps> = ({
  as: Tag = "div",
  className = "",
  ...props
}) => {
  return (
    <Tag
      className={`bg-white rounded-lg border border-gray-200 shadow-sm p-5 dark:bg-gray-800 dark:border-gray-700 ${className}`.trim()}
      {...props}
    />
  );
};

export default Card;
