import React, { useSyncExternalStore } from "react";
import { hasSlowRequests, subscribeToSlowRequests } from "~/services/api";
import Spinner from "./Spinner";

const ServerWakingNotice: React.FC = () => {
  const visible = useSyncExternalStore(
    subscribeToSlowRequests,
    hasSlowRequests
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-lg dark:border-primary-900 dark:bg-gray-800 dark:text-gray-200">
        <Spinner label="Waiting for the server" />
        <p>Waking up the server. This can take up to a minute.</p>
      </div>
    </div>
  );
};

export default ServerWakingNotice;
