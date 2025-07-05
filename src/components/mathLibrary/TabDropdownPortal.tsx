import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./TabDropdownPortal.module.css";
import Tooltip from "../tooltips/Tooltip";

type Props = {
  anchorRef: React.RefObject<HTMLButtonElement>;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onClose: () => void;
};

const TabDropdownPortal: React.FC<Props> = ({
  anchorRef,
  onRename,
  onDuplicate,
  onDelete,
  onArchive,
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

  // Calculate position before paint
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

  // Handle outside click
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
      <Tooltip text="Rename collection">
        <button onClick={onRename}>✏️ Rename</button>
      </Tooltip>
      <Tooltip text="Duplicate collection">
        <button onClick={onDuplicate}>📄 Duplicate</button>
      </Tooltip>
      <Tooltip text="Move to archive">
        <button onClick={onArchive}>📦 Archive</button>
      </Tooltip>
      <Tooltip text="Delete permanently">
        <button className={styles.deleteButton} onClick={onDelete}>🗑️ Delete</button>
      </Tooltip>
    </div>,
    document.body
  );
};

export default TabDropdownPortal;
