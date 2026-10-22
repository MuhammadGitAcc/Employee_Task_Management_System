import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastContext } from "./toast.context";
import type { ToastTone } from "./toast.context";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

const TOAST_DURATION_MS = 4000;

const toneClasses: Record<ToastTone, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-800 text-white dark:bg-gray-700",
};

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const live = useRef(new Map<number, { key: string; timer: number }>());

  useEffect(() => {
    const entries = live.current;
    return () => entries.forEach((entry) => window.clearTimeout(entry.timer));
  }, []);

  const dismiss = useCallback((id: number) => {
    const entry = live.current.get(id);
    if (!entry) return;
    window.clearTimeout(entry.timer);
    live.current.delete(id);
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const key = `${tone}:${message}`;
      for (const entry of live.current.values()) {
        if (entry.key === key) return;
      }
      const id = nextId.current++;
      const timer = window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
      live.current.set(id, { key, timer });
      setToasts((previous) => [...previous, { id, message, tone }]);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto flex w-full max-w-sm flex-col gap-2 px-4 sm:inset-x-auto sm:right-4 sm:mx-0 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-md px-4 py-3 text-sm shadow-lg ${toneClasses[toast.tone]}`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
