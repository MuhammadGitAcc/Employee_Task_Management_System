import React from "react";
import Card from "~/components/ui/Card";
import Skeleton from "~/components/ui/Skeleton";
import PageContainer from "./PageContainer";

const PLACEHOLDER_CARDS = [0, 1, 2];

const PageSkeleton: React.FC = () => {
  return (
    <PageContainer>
      <div role="status" aria-busy="true">
        <span className="sr-only">Loading page</span>
        <Skeleton className="mx-auto mb-6 h-9 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLACEHOLDER_CARDS.map((item) => (
            <Card key={item} className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default PageSkeleton;
