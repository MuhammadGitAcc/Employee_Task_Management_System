export type NotificationKind = "overdue" | "due-soon" | "assigned";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  taskId: string;
  message: string;
  detail: string;
}
