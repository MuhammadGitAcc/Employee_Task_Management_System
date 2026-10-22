import type {
  TaskActivity,
  TaskComment,
} from "~/features/tasks/task.collab.types";
import { api } from "./api";

export const listComments = async (taskId: string): Promise<TaskComment[]> => {
  const { comments } = await api.get<{ comments: TaskComment[] }>(
    `/tasks/${taskId}/comments`
  );
  return comments;
};

export const addComment = async (
  taskId: string,
  text: string
): Promise<TaskComment> => {
  const { comment } = await api.post<{ comment: TaskComment }>(
    `/tasks/${taskId}/comments`,
    { text }
  );
  return comment;
};

export const listActivity = async (taskId: string): Promise<TaskActivity[]> => {
  const { activity } = await api.get<{ activity: TaskActivity[] }>(
    `/tasks/${taskId}/activity`
  );
  return activity;
};
