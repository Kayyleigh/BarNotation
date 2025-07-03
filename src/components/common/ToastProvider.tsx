import React, { useState, useCallback, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { ToastContext, type Toast } from "../../hooks/toastContext";
import ToastRenderer from "./ToastRenderer";

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = uuidv4();
    const duration = toast.duration ?? 4000;
    const newToast: Toast = { id, ...toast };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast rendering isolated from re-rendering app */}
      <ToastRenderer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};
