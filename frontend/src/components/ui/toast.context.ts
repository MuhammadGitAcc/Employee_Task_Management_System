import { createContext, useContext } from "react";

export type ToastTone = "success" | "error" | "info";

export interface ToastApi {
  showToast: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export const useToast = (): ToastApi => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
};
