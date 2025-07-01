import { createContext } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
