import { useCallback, useMemo, useState } from "react";
import { useAuth } from "~/features/auth/useAuth";
import { useTasks } from "~/features/tasks/useTasks";
import { storage } from "~/services/storage";
import { getNotifications } from "./notification.logic";

const readKey = (userId: string): string => `notificationsRead:${userId}`;

const loadReadIds = (userId: string): string[] => {
  const stored = storage.get<unknown>(readKey(userId), []);
  return Array.isArray(stored)
    ? stored.filter((value): value is string => typeof value === "string")
    : [];
};

export const useNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const userName = user?.name ?? "";
  const { tasks } = useTasks();
  const [readIds, setReadIds] = useState<string[]>(() => loadReadIds(userId));

  const notifications = useMemo(
    () => getNotifications(tasks, userName),
    [tasks, userName]
  );
  const unreadCount = notifications.filter(
    (item) => !readIds.includes(item.id)
  ).length;

  const save = useCallback(
    (ids: string[]) => {
      const current = new Set(notifications.map((item) => item.id));
      const next = ids.filter((id) => current.has(id));
      setReadIds(next);
      storage.set(readKey(userId), next);
    },
    [notifications, userId]
  );

  const markRead = (id: string) => {
    if (readIds.includes(id)) return;
    save([...readIds, id]);
  };

  const markAllRead = () => save(notifications.map((item) => item.id));

  return { notifications, readIds, unreadCount, markRead, markAllRead };
};
