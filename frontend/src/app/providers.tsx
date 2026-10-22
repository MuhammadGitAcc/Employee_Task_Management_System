import React from "react";
import ServerWakingNotice from "~/components/ui/ServerWakingNotice";
import ToastProvider from "~/components/ui/ToastProvider";
import AuthProvider from "~/features/auth/AuthProvider";
import TasksProvider from "~/features/tasks/TasksProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <TasksProvider>{children}</TasksProvider>
      </AuthProvider>
      <ServerWakingNotice />
    </ToastProvider>
  );
};

export default Providers;
