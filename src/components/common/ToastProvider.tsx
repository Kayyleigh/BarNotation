import React, { useState, type ReactNode, } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./toast.module.css";
import { ToastContext, type Toast } from "../../hooks/toastContext";

const toastEmojiMap = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = uuidv4();
    const duration = toast.duration ?? 4000;
    const newToast: Toast = { id, ...toast };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type || "info"]}`}
          >
            <span className={styles.emoji}>
              {toastEmojiMap[toast.type || "info"]}
            </span>
            <span className={styles.message}>{toast.message}</span>
            {toast.onAction && toast.actionLabel && (
              <button
                className={styles.toastAction}
                onClick={() => {
                  toast.onAction?.();
                  removeToast(toast.id);
                }}
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
