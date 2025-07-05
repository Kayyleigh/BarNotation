import React, { useState, useCallback, type ReactNode, useMemo } from "react";
import ReactDOM from "react-dom";
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

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <>
      <ToastContext.Provider value={value}>
        {children}
      </ToastContext.Provider>
      {ReactDOM.createPortal(
        <ToastRenderer toasts={toasts} onRemove={removeToast} />,
        document.body
      )}
    </>
  );
};
