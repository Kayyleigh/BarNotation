import React, { useRef, useEffect, useState } from "react";
import styles from "./ResizableSidebar.module.css";
import Tooltip from "../tooltips/Tooltip";
import CollapseIcon from "../icons/CollapseIcon";

interface ResizableSidebarProps {
  side: "left" | "right";
  title: string;
  width: number;
  onWidthChange: (width: number) => void;
  storageKey: string;
  minWidth?: number;
  collapsedWidth?: number;
  children: React.ReactNode;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  side,
  title,
  width,
  onWidthChange,
  storageKey,
  minWidth = 150,
  collapsedWidth = 8,
  children,
}) => {
  const isDraggingRef = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(width <= collapsedWidth);
  const [storedWidth, setStoredWidth] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved) : 300;
  });

  useEffect(() => {
    setIsCollapsed(width <= collapsedWidth);
  }, [collapsedWidth, width]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const dx = side === "right" ? startX - e.clientX : e.clientX - startX;
      const newWidth = Math.max(collapsedWidth, startWidth + dx);
      onWidthChange(newWidth);
      setStoredWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      localStorage.setItem(storageKey, String(storedWidth));
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      onWidthChange(storedWidth || minWidth);
    } else {
      localStorage.setItem(storageKey, String(width));
      onWidthChange(collapsedWidth);
    }
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`${styles.sidebar} ${styles[side]}`}
      style={{ width: `${width}px`, minWidth: collapsedWidth }}
    >
      <div className={styles.resizer} onMouseDown={handleMouseDown}>
        <Tooltip text={isCollapsed ? `Show ${title}` : `Hide ${title}`}>
          <button className={styles.toggleButton} onClick={toggleCollapse}>
            <CollapseIcon size={8} direction={side === "left" ? (isCollapsed ? "left" : "right") : isCollapsed ? "right" : "left"} />
          </button>
        </Tooltip>
      </div>

      {!isCollapsed && <div className={styles.content}>{children}</div>}
    </div>
  );
};

export default React.memo(ResizableSidebar);
