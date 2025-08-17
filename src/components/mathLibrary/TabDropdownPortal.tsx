// components/mathLibrary/TabDropdownPortal.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./TabDropdownPortal.module.css";
import Tooltip from "../tooltips/Tooltip";
import { useI18n } from "../../i18n/useI18n";

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
  const { t } = useI18n(); // use language hook

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
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
  
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
  
      let top = rect.bottom + window.scrollY + 4;
      let maxHeight = spaceBelow - 8;
  
      // Vertical flip if not enough space below
      if (spaceBelow < dropdown.offsetHeight && spaceAbove > spaceBelow) {
        top = rect.top + window.scrollY - dropdown.offsetHeight - 4;
        maxHeight = spaceAbove - 8;
      }
  
      // Horizontal clamp to prevent overflow
      let left = rect.left + window.scrollX;
      if (left + dropdown.offsetWidth > viewportWidth - 8) {
        left = viewportWidth - dropdown.offsetWidth - 8;
      }
      if (left < 8) {
        left = 8; // small margin from left edge
      }
  
      setStyle({
        position: "absolute",
        top,
        left,
        zIndex: 1000,
        visibility: "visible",
        opacity: 1,
        pointerEvents: "auto",
        maxHeight: Math.min(300, maxHeight),
        overflowY: "auto",
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
      <Tooltip text={t("mathLibrary.tabMenu.renameTooltip")}>
        <button onClick={onRename}>✏️ {t("mathLibrary.tabMenu.rename")}</button>
      </Tooltip>
      <Tooltip text={t("mathLibrary.tabMenu.duplicateTooltip")}>
        <button onClick={onDuplicate}>📄 {t("mathLibrary.tabMenu.duplicate")}</button>
      </Tooltip>
      <Tooltip text={t("mathLibrary.tabMenu.archiveTooltip")}>
        <button onClick={onArchive}>📦 {t("mathLibrary.tabMenu.archive")}</button>
      </Tooltip>
      <Tooltip text={t("mathLibrary.tabMenu.deleteTooltip")}>
        <button className={styles.deleteButton} onClick={onDelete}>🗑️ {t("mathLibrary.tabMenu.delete")}</button>
      </Tooltip>
    </div>,
    document.body
  );
};

export default TabDropdownPortal;
