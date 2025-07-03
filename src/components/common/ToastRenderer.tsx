import React from "react";
import styles from "./toast.module.css";
import type { Toast } from "../../hooks/toastContext";

const toastEmojiMap = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

interface ToastRendererProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastRenderer: React.FC<ToastRendererProps> = React.memo(({ toasts, onRemove }) => {
  return (
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
                onRemove(toast.id);
              }}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
});

export default ToastRenderer;
