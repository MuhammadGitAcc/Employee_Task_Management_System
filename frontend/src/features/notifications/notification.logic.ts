import { isAssignedTo } from "~/features/tasks/task.assignee";
import { getDueState } from "~/features/tasks/task.due";
import type { Task } from "~/features/tasks/task.types";
import type { AppNotification, NotificationKind } from "./notification.types";

const KIND_ORDER: Record<NotificationKind, number> = {
  overdue: 0,
  "due-soon": 1,
  assigned: 2,
};

const NO_DUE_DATE = "9999-12-31";

export const getNotifications = (
  tasks: Task[],
  userName: string
): AppNotification[] => {
  if (!userName) return [];

  const mine = tasks.filter(
    (task) => isAssignedTo(task, userName) && task.status !== "Done"
  );
  const items: { dueDate: string; notification: AppNotification }[] = [];

  mine.forEach((task) => {
    const dueDate = task.dueDate || NO_DUE_DATE;
    const dueState = getDueState(task);

    if (dueState === "overdue") {
      items.push({
        dueDate,
        notification: {
          id: `overdue:${task.id}:${task.dueDate}`,
          kind: "overdue",
          taskId: task.id,
          message: `"${task.title}" is overdue`,
          detail: `Was due ${task.dueDate}`,
        },
      });
    } else if (dueState === "due-soon") {
      items.push({
        dueDate,
        notification: {
          id: `due-soon:${task.id}:${task.dueDate}`,
          kind: "due-soon",
          taskId: task.id,
          message: `"${task.title}" is due soon`,
          detail: `Due ${task.dueDate}`,
        },
      });
    }

    items.push({
      dueDate,
      notification: {
        id: `assigned:${task.id}`,
        kind: "assigned",
        taskId: task.id,
        message: `You were assigned "${task.title}"`,
        detail: task.dueDate ? `Due ${task.dueDate}` : "No due date",
      },
    });
  });

  return items
    .sort(
      (a, b) =>
        KIND_ORDER[a.notification.kind] - KIND_ORDER[b.notification.kind] ||
        a.dueDate.localeCompare(b.dueDate)
    )
    .map((item) => item.notification);
};
