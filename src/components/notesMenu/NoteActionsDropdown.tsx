// components/NoteActionsDropdown.tsx
import React, { useLayoutEffect, useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./NoteActionsDropdown.module.css";

type Props = {
  anchorRef: React.RefObject<HTMLButtonElement>;
  onDelete: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onExportLatex: () => void;
  onClose: () => void;
};

const NoteActionsDropdown: React.FC<Props> = ({
  anchorRef,
  onDelete,
  onArchive,
  onDuplicate,
  onExportLatex,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    visibility: "hidden",
    opacity: 0,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1000,
    pointerEvents: "none",
  });

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const dropdown = menuRef.current;
    if (anchor && dropdown) {
      const rect = anchor.getBoundingClientRect();
      setStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        zIndex: 1000,
        visibility: "visible",
        opacity: 1,
        pointerEvents: "auto",
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div ref={menuRef} className={styles.dropdownMenu} style={style}>
      <button onClick={onArchive}>📦 Archive</button>
      <button onClick={onDuplicate}>📄 Duplicate</button>
      <button onClick={onExportLatex}>📤 Export to LaTeX</button>
      <button className={styles.deleteButton} onClick={onDelete}>🗑️ Delete</button>
    </div>,
    document.body
  );
};

export default NoteActionsDropdown;
