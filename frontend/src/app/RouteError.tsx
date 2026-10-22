import React from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import PageContainer from "~/components/layout/PageContainer";
import Button from "~/components/ui/Button";
import ErrorState from "~/components/ui/ErrorState";

const RouteError: React.FC = () => {
  const error = useRouteError();
  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong while showing this page.";

  return (
    <PageContainer size="narrow">
      <ErrorState
        title="Something went wrong"
        description={description}
        action={
          <div className="flex justify-center gap-3">
            <Button onClick={() => window.location.reload()}>
              Reload page
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.assign("/")}
            >
              Go to tasks
            </Button>
          </div>
        }
      />
    </PageContainer>
  );
};

export default RouteError;
