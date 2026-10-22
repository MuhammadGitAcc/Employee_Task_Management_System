import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "~/components/ui/Badge";
import type { BadgeTone } from "~/components/ui/Badge";
import type { NotificationKind } from "./notification.types";
import { useNotifications } from "./useNotifications";

const KIND_LABELS: Record<NotificationKind, string> = {
  overdue: "Overdue",
  "due-soon": "Due soon",
  assigned: "Assigned",
};

const KIND_TONES: Record<NotificationKind, BadgeTone> = {
  overdue: "red",
  "due-soon": "yellow",
  assigned: "blue",
};

const NotificationBell: React.FC = () => {
  const { notifications, readIds, unreadCount, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls="notification-panel"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative rounded-md p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-medium text-white"
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          id="notification-panel"
          role="region"
          aria-label="Notification list"
          className="fixed inset-x-4 top-16 z-40 rounded-lg border border-gray-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded text-xs font-medium text-primary-600 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-primary-300 dark:hover:text-primary-200"
              >
                Mark all as read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              You are all caught up.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
              {notifications.map((item) => {
                const unread = !readIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <Link
                      to="/tasks"
                      onClick={() => {
                        markRead(item.id);
                        setOpen(false);
                      }}
                      className={`block px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700 ${
                        unread ? "bg-primary-50/40 dark:bg-primary-900/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm text-gray-800 dark:text-gray-100 ${
                            unread ? "font-semibold" : ""
                          }`}
                        >
                          {item.message}
                        </p>
                        <Badge tone={KIND_TONES[item.kind]}>
                          {KIND_LABELS[item.kind]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {item.detail}
                        {unread && " · New"}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
