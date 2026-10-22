import { useContext } from "react";
import { TasksContext } from "./tasks.context";
import type { TasksContextValue } from "./tasks.context";

export const useTasks = (): TasksContextValue => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used inside <TasksProvider>");
  }
  return context;
};
