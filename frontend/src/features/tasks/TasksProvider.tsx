import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "~/features/auth/useAuth";
import { ApiError } from "~/services/api";
import { connectChatSocket } from "~/services/chatSocket";
import * as tasksApi from "~/services/tasks";
import type { Task, TaskInput, TaskStatus } from "./task.types";
import { TasksContext } from "./tasks.context";
import type { TasksContextValue, TasksStatus } from "./tasks.context";

interface TasksProviderProps {
  children: React.ReactNode;
}

const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<TasksStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setStatus("loading");
      return;
    }
    let cancelled = false;
    tasksApi
      .listTasks()
      .then((list) => {
        if (cancelled) return;
        setTasks(list);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Could not load the tasks."
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setAttempt((previous) => previous + 1);
  }, []);

  // Keeps the list fresh when other users change tasks. The refresh is silent
  // (no skeletons). After a reconnect the list is loaded again, because the
  // events sent while the connection was down were missed.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let hasOpened = false;
    const refresh = () => {
      tasksApi
        .listTasks()
        .then((list) => {
          if (!cancelled) setTasks(list);
        })
        .catch(() => {});
    };
    const stop = connectChatSocket({
      onTasksChanged: refresh,
      onStatus: (next) => {
        if (next !== "open") return;
        if (hasOpened) refresh();
        hasOpened = true;
      },
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [userId]);

  const addTask = useCallback(async (input: TaskInput): Promise<Task> => {
    const created = await tasksApi.createTask(input);
    setTasks((previous) => [...previous, created]);
    return created;
  }, []);

  const updateTask = useCallback(
    async (id: string, input: TaskInput): Promise<Task> => {
      const updated = await tasksApi.updateTask(id, input);
      setTasks((previous) =>
        previous.map((task) => (task.id === id ? updated : task))
      );
      return updated;
    },
    []
  );

  const moveTask = useCallback(
    async (id: string, nextStatus: TaskStatus): Promise<Task> => {
      const updated = await tasksApi.updateTaskStatus(id, nextStatus);
      setTasks((previous) =>
        previous.map((task) => (task.id === id ? updated : task))
      );
      return updated;
    },
    []
  );

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await tasksApi.deleteTask(id);
    setTasks((previous) => previous.filter((task) => task.id !== id));
  }, []);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      status,
      errorMessage,
      reload,
      addTask,
      updateTask,
      moveTask,
      deleteTask,
    }),
    [
      tasks,
      status,
      errorMessage,
      reload,
      addTask,
      updateTask,
      moveTask,
      deleteTask,
    ]
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

export default TasksProvider;
