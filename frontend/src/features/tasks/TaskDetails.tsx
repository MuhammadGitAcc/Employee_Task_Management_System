import React, { useState } from "react";
import Button from "~/components/ui/Button";
import ErrorState from "~/components/ui/ErrorState";
import Skeleton from "~/components/ui/Skeleton";
import Textarea from "~/components/ui/Textarea";
import { getErrorMessage } from "~/services/api";
import { formatDateTime } from "~/utils/helpers";
import type { TaskActivity, TaskComment } from "./task.collab.types";

interface TaskDetailsProps {
  comments: TaskComment[];
  activity: TaskActivity[];
  status: "loading" | "ready" | "error";
  errorMessage: string;
  onRetry: () => void;
  onAddComment: (text: string) => Promise<void>;
}

const COMMENT_MAX_LENGTH = 500;

const TaskDetails: React.FC<TaskDetailsProps> = ({
  comments,
  activity,
  status,
  errorMessage,
  onRetry,
  onAddComment,
}) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const recentFirst = [...activity].reverse();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }
    if (trimmed.length > COMMENT_MAX_LENGTH) {
      setError(`Comment must be ${COMMENT_MAX_LENGTH} characters or fewer.`);
      return;
    }
    setSubmitting(true);
    try {
      await onAddComment(trimmed);
      setText("");
      setError("");
    } catch (failure) {
      setError(getErrorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div role="status" aria-label="Loading details" className="space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        title="Could not load the details"
        description={errorMessage}
        action={<Button onClick={onRetry}>Try again</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-200">
          Comments ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No comments yet.
          </p>
        ) : (
          <ul
            tabIndex={0}
            aria-label="Comments"
            className="space-y-3 max-h-60 overflow-y-auto"
          >
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="bg-gray-50 rounded-md p-3 dark:bg-gray-700"
              >
                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words dark:text-gray-100">
                  {comment.text}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {comment.author} · {formatDateTime(comment.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleSubmit} noValidate className="mt-3 space-y-3">
          <Textarea
            label="Add a comment"
            rows={3}
            value={text}
            error={error}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post comment"}
          </Button>
        </form>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-200">
          Activity
        </h3>
        {recentFirst.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No activity recorded yet.
          </p>
        ) : (
          <ul
            tabIndex={0}
            aria-label="Activity history"
            className="space-y-2 max-h-48 overflow-y-auto"
          >
            {recentFirst.map((entry) => (
              <li
                key={entry.id}
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {entry.actor}
                </span>{" "}
                {entry.message}
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default TaskDetails;
