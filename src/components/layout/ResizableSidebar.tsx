// components/layout/ResizableSidebar.tsx
import React, { useRef, useCallback, useEffect } from "react";
import styles from "./ResizableSidebar.module.css";
import Tooltip from "../tooltips/Tooltip";
import CollapseIcon from "../icons/CollapseIcon";
import { PANEL_EDGE_WIDTH } from "../../constants/editorConstants";
import type { PanelSide } from "../../hooks/resizablePanels/useResizablePanels";
import { useResizablePanels } from "../../hooks/resizablePanels/ResizableContext";

interface ResizableSidebarProps {
  side: PanelSide; // "left" | "right"
  title: string;
  children: React.ReactNode;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  side,
  title,
  children,
}) => {
  const { state, setWidth, toggle } = useResizablePanels();

  const width = state[side].width;
  const isCollapsed = state[side].collapsed;

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      hasMovedRef.current = false;
      document.body.style.userSelect = "none";
    },
    [width]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const dx =
        side === "right"
          ? startXRef.current - e.clientX
          : e.clientX - startXRef.current;

      const rawNewWidth = startWidthRef.current + dx;
      const newWidth = Math.max(PANEL_EDGE_WIDTH, rawNewWidth);

      if (Math.abs(dx) > 2) {
        hasMovedRef.current = true;
      }

      setWidth(side, newWidth);
    },
    [side, setWidth]
  );

  const toggleCollapse = useCallback(() => {
    toggle(side);
  }, [side, toggle]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      document.body.style.userSelect = "";

      if (!hasMovedRef.current && !isCollapsed && width <= PANEL_EDGE_WIDTH + 2) {
        toggleCollapse();
      }
    }
  }, [isCollapsed, width, toggleCollapse]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`${styles.sidebar} ${styles[side]}`}
      style={{
        width: isCollapsed ? `${PANEL_EDGE_WIDTH}px` : `${width}px`,
        minWidth: `${PANEL_EDGE_WIDTH}px`,
      }}
    >
      <div className={styles.resizer} onMouseDown={handleMouseDown}>
        <Tooltip text={isCollapsed ? `Show ${title}` : `Hide ${title}`}>
          <button
            className={styles.toggleButton}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
          >
            <CollapseIcon
              size={PANEL_EDGE_WIDTH}
              direction={
                side === "left"
                  ? isCollapsed
                    ? "left"
                    : "right"
                  : isCollapsed
                  ? "right"
                  : "left"
              }
            />
          </button>
        </Tooltip>
      </div>

      {!isCollapsed && <div className={styles.content}>{children}</div>}
    </div>
  );
};

export default React.memo(ResizableSidebar);

