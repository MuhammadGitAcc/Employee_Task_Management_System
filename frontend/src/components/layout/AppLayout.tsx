import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import PageSkeleton from "./PageSkeleton";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-700 focus:shadow-lg dark:focus:bg-gray-800 dark:focus:text-primary-300"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AppLayout;
