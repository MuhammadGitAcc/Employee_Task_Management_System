import React from "react";
import { RouterProvider } from "react-router-dom";
import ErrorBoundary from "~/components/ui/ErrorBoundary";
import Providers from "./providers";
import { router } from "./router";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  );
};

export default App;
