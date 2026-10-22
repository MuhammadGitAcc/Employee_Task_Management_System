import React from "react";
import PageContainer from "~/components/layout/PageContainer";
import PageHeader from "~/components/layout/PageHeader";
import Card from "~/components/ui/Card";
import { useAuth } from "~/features/auth/useAuth";
import { isAssignedTo } from "~/features/tasks/task.assignee";
import { useTasks } from "~/features/tasks/useTasks";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();

  if (!user) return null;

  const myTasks = tasks.filter((task) => isAssignedTo(task, user.name));
  const tasksCompleted = myTasks.filter(
    (task) => task.status === "Done"
  ).length;

  return (
    <PageContainer size="narrow">
      <PageHeader title="Employee Profile" />
      <Card>
        <div className="space-y-6 text-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {user.name}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {user.role}
            </p>
          </div>
          <div className="text-gray-700 dark:text-gray-200">
            <p className="text-md">
              Email: <span className="font-medium">{user.email}</span>
            </p>
            <p className="text-md">
              Tasks Assigned:{" "}
              <span className="font-medium">{myTasks.length}</span>
            </p>
            <p className="text-md">
              Tasks Completed:{" "}
              <span className="font-medium">{tasksCompleted}</span>
            </p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Profile;
