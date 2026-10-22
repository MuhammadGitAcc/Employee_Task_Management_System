import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-3xl font-bold text-gray-800 dark:text-gray-100">
        Page not found
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
      >
        Back to tasks
      </Link>
    </div>
  );
};

export default NotFound;
