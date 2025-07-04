// components/modals/Modal.tsx
import React, { useEffect, useRef } from "react";
import styles from "./Modal.module.css"; // Shared modal styles
import Tooltip from "../tooltips/Tooltip";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, className, showCloseButton = true }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modalContent} ${className || ""}`} ref={contentRef}>
        <div className={styles.close}>
        <Tooltip text="Close">
          {showCloseButton && (
            <button className={styles.closeButton} onClick={onClose}>✕</button>
          )}
        </Tooltip>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
