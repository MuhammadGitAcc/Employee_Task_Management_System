import React from "react";
import Button from "./Button";
import ErrorState from "./ErrorState";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <ErrorState
            title="Something went wrong"
            description="The app ran into an unexpected problem. Reloading the page usually fixes it."
            action={
              <Button onClick={() => window.location.reload()}>
                Reload page
              </Button>
            }
          />
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
