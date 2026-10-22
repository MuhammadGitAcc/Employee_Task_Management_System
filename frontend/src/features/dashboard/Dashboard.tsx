import React from "react";
import PageContainer from "~/components/layout/PageContainer";
import PageHeader from "~/components/layout/PageHeader";
import Button from "~/components/ui/Button";
import ErrorState from "~/components/ui/ErrorState";
import Skeleton from "~/components/ui/Skeleton";
import { useAuth } from "~/features/auth/useAuth";
import { useTasks } from "~/features/tasks/useTasks";
import BarChart from "./BarChart";
import StatCard from "./StatCard";
import {
  getAssigneeData,
  getPriorityData,
  getStatusData,
} from "./dashboard.charts";
import { getTaskStats } from "./dashboard.stats";
import {
  MAX_WIDGET_ITEMS,
  UPCOMING_DAYS,
  getMyTasks,
  getUpcomingDeadlines,
} from "./dashboard.tasks";
import TaskListWidget from "./TaskListWidget";

const Dashboard: React.FC = () => {
  const { tasks, status, errorMessage, reload } = useTasks();
  const { user } = useAuth();
  const stats = getTaskStats(tasks);
  const statusData = getStatusData(tasks);
  const priorityData = getPriorityData(tasks);
  const assigneeData = getAssigneeData(tasks);
  const myTasks = getMyTasks(tasks, user?.name ?? "");
  const upcomingDeadlines = getUpcomingDeadlines(tasks);

  if (status !== "ready") {
    return (
      <PageContainer>
        <PageHeader title="Dashboard" />
        {status === "error" ? (
          <ErrorState
            title="Could not load the dashboard"
            description={errorMessage}
            action={<Button onClick={reload}>Try again</Button>}
          />
        ) : (
          <div
            role="status"
            aria-label="Loading dashboard"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total tasks" value={stats.total} />
        <StatCard label="In progress" value={stats.inProgress} tone="blue" />
        <StatCard label="Done" value={stats.done} tone="green" />
        <StatCard label="Overdue" value={stats.overdue} tone="red" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <BarChart title="Tasks by status" data={statusData} />
        <BarChart title="Tasks by priority" data={priorityData} />
        <BarChart title="Tasks per employee" data={assigneeData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <TaskListWidget
          title={`My tasks (${myTasks.length})`}
          tasks={myTasks.slice(0, MAX_WIDGET_ITEMS)}
          emptyText="You have no open tasks."
        />
        <TaskListWidget
          title="Upcoming deadlines"
          tasks={upcomingDeadlines.slice(0, MAX_WIDGET_ITEMS)}
          emptyText={`No open deadlines in the next ${UPCOMING_DAYS} days.`}
          showAssignee
        />
      </div>
    </PageContainer>
  );
};

export default Dashboard;
