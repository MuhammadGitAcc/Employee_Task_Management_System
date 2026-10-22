import { useCallback, useEffect, useState } from "react";
import { ApiError } from "~/services/api";
import * as commentsApi from "~/services/comments";
import type { TaskActivity, TaskComment } from "./task.collab.types";

type DetailsStatus = "loading" | "ready" | "error";

export const useTaskDetails = (taskId: string | null) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [status, setStatus] = useState<DetailsStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!taskId) {
      setComments([]);
      setActivity([]);
      setStatus("loading");
      return;
    }
    let cancelled = false;
    Promise.all([
      commentsApi.listComments(taskId),
      commentsApi.listActivity(taskId),
    ])
      .then(([commentList, activityList]) => {
        if (cancelled) return;
        setComments(commentList);
        setActivity(activityList);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Could not load the details."
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [taskId, attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setAttempt((previous) => previous + 1);
  }, []);

  const addComment = useCallback(
    async (text: string): Promise<void> => {
      if (!taskId) return;
      const created = await commentsApi.addComment(taskId, text);
      setComments((previous) => [...previous, created]);
    },
    [taskId]
  );

  return { comments, activity, status, errorMessage, reload, addComment };
};
