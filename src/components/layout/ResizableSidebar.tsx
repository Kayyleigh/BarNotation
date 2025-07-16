// import React, { useRef, useEffect, useState } from "react";
// import styles from "./ResizableSidebar.module.css";
// import Tooltip from "../tooltips/Tooltip";
// import CollapseIcon from "../icons/CollapseIcon";

// interface ResizableSidebarProps {
//   side: "left" | "right";
//   title: string;
//   width: number;
//   onWidthChange: (width: number) => void;
//   storageKey: string;
//   PANEL_EDGE_WIDTH?: number;
//   collapsedWidth?: number;
//   children: React.ReactNode;
// }

// const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
//   side,
//   title,
//   width,
//   onWidthChange,
//   storageKey,
//   PANEL_EDGE_WIDTH = 150,
//   collapsedWidth = 8,
//   children,
// }) => {
//   const isDraggingRef = useRef(false);
//   const [isCollapsed, setIsCollapsed] = useState(width <= collapsedWidth);
//   const [storedWidth, setStoredWidth] = useState<number>(() => {
//     const saved = localStorage.getItem(storageKey);
//     return saved ? parseInt(saved) : 300;
//   });

//   useEffect(() => {
//     setIsCollapsed(width <= collapsedWidth);
//   }, [collapsedWidth, width]);

//   const handleMouseDown = (e: React.MouseEvent) => {
//     isDraggingRef.current = true;
//     const startX = e.clientX;
//     const startWidth = width;

//     const handleMouseMove = (e: MouseEvent) => {
//       if (!isDraggingRef.current) return;

//       const dx = side === "right" ? startX - e.clientX : e.clientX - startX;
//       const newWidth = Math.max(collapsedWidth, startWidth + dx);
//       onWidthChange(newWidth);
//       setStoredWidth(newWidth);
//     };

//     const handleMouseUp = () => {
//       isDraggingRef.current = false;
//       localStorage.setItem(storageKey, String(storedWidth));
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };

//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", handleMouseUp);
//   };

//   const toggleCollapse = () => {
//     if (isCollapsed) {
//       onWidthChange(storedWidth || PANEL_EDGE_WIDTH);
//     } else {
//       localStorage.setItem(storageKey, String(width));
//       onWidthChange(collapsedWidth);
//     }
//     setIsCollapsed(!isCollapsed);
//   };

//   return (
//     <div
//       className={`${styles.sidebar} ${styles[side]}`}
//       style={{ width: `${width}px`, PANEL_EDGE_WIDTH: collapsedWidth }}
//     >
//       <div className={styles.resizer} onMouseDown={handleMouseDown}>
//         <Tooltip text={isCollapsed ? `Show ${title}` : `Hide ${title}`}>
//           <button className={styles.toggleButton} onClick={toggleCollapse}>
//             <CollapseIcon size={8} direction={side === "left" ? (isCollapsed ? "left" : "right") : isCollapsed ? "right" : "left"} />
//           </button>
//         </Tooltip>
//       </div>

//       {!isCollapsed && <div className={styles.content}>{children}</div>}
//     </div>
//   );
// };

// export default React.memo(ResizableSidebar);

// import React, { useRef, useCallback, useEffect } from "react";
// import styles from "./ResizableSidebar.module.css";
// import Tooltip from "../tooltips/Tooltip";
// import CollapseIcon from "../icons/CollapseIcon";

// interface ResizableSidebarProps {
//   side: "left" | "right";
//   title: string;
//   width: number;
//   PANEL_EDGE_WIDTH?: number;
//   collapsedWidth?: number;
//   isCollapsed: boolean;
//   onCollapseToggle: () => void;
//   onWidthChange: (newWidth: number) => void;
//   children: React.ReactNode;
// }

// const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
//   side,
//   title,
//   width,
//   collapsedWidth = 8,
//   isCollapsed,
//   onCollapseToggle,
//   onWidthChange,
//   children,
// }) => {
//   const isDraggingRef = useRef(false);
//   const startXRef = useRef(0);
//   const startWidthRef = useRef(0);
//   const hasMovedRef = useRef(false);

//   const handleMouseDown = useCallback((e: React.MouseEvent) => {
//     isDraggingRef.current = true;
//     startXRef.current = e.clientX;
//     startWidthRef.current = width;
//     hasMovedRef.current = false;

//     document.body.style.userSelect = "none";
//   }, [width]);

//   const handleMouseMove = useCallback((e: MouseEvent) => {
//     if (!isDraggingRef.current) return;

//     const dx = side === "right"
//       ? startXRef.current - e.clientX
//       : e.clientX - startXRef.current;

//     const rawNewWidth = startWidthRef.current + dx;
//     const newWidth = Math.max(collapsedWidth, rawNewWidth);

//     if (Math.abs(dx) > 2) {
//       hasMovedRef.current = true;
//     }

//     onWidthChange(newWidth);
//   }, [side, collapsedWidth, onWidthChange]);

//   const handleMouseUp = useCallback(() => {
//     if (isDraggingRef.current) {
//       isDraggingRef.current = false;
//       document.body.style.userSelect = "";

//       // If the user *clicked* (but didn't drag), toggle collapse
//       if (!hasMovedRef.current && width <= collapsedWidth + 2) {
//         onCollapseToggle();
//       }
//     }
//   }, [width, collapsedWidth, onCollapseToggle]);

//   useEffect(() => {
//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseup", handleMouseUp);
//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [handleMouseMove, handleMouseUp]);

//   return (
//     <div
//       className={`${styles.sidebar} ${styles[side]}`}
//       style={{
//         width: `${width}px`,
//         PANEL_EDGE_WIDTH: `${collapsedWidth}px`,
//       }}
//     >
//       <div className={styles.resizer} onMouseDown={handleMouseDown}>
//         <Tooltip text={isCollapsed ? `Show ${title}` : `Hide ${title}`}>
//           <button
//             className={styles.toggleButton}
//             onClick={onCollapseToggle}
//             aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
//           >
//             <CollapseIcon
//               size={8}
//               direction={
//                 side === "left"
//                   ? isCollapsed ? "left" : "right"
//                   : isCollapsed ? "right" : "left"
//               }
//             />
//           </button>
//         </Tooltip>
//       </div>

//       {!isCollapsed && (
//         <div className={styles.content}>
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

// export default React.memo(ResizableSidebar);

// import React, { useRef, useCallback, useEffect, useState } from "react";
// import styles from "./ResizableSidebar.module.css";
// import Tooltip from "../tooltips/Tooltip";
// import CollapseIcon from "../icons/CollapseIcon";
// import { PANEL_EDGE_WIDTH } from "../../constants/editorConstants";

// interface ResizableSidebarProps {
//   side: "left" | "right";
//   title: string;
//   storageKey: string;
//   children: React.ReactNode;
// }

// const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
//   side,
//   title,
//   storageKey,
//   children,
// }) => {
//   const [width, setWidth] = useState(() => {
//     const stored = localStorage.getItem(`${storageKey}-width`);
//     return stored ? parseInt(stored, 10) : PANEL_EDGE_WIDTH;
//   });

//   const [isCollapsed, setIsCollapsed] = useState(() => {
//     return localStorage.getItem(`${storageKey}-collapsed`) === "true";
//   });

//   const isDraggingRef = useRef(false);
//   const startXRef = useRef(0);
//   const startWidthRef = useRef(0);
//   const hasMovedRef = useRef(false);

//   const handleMouseDown = useCallback((e: React.MouseEvent) => {
//     isDraggingRef.current = true;
//     startXRef.current = e.clientX;
//     startWidthRef.current = width;
//     hasMovedRef.current = false;

//     document.body.style.userSelect = "none";
//   }, [width]);

//   const handleMouseMove = useCallback((e: MouseEvent) => {
//     if (!isDraggingRef.current) return;

//     const dx = side === "right"
//       ? startXRef.current - e.clientX
//       : e.clientX - startXRef.current;

//     const rawNewWidth = startWidthRef.current + dx;
//     const newWidth = Math.max(PANEL_EDGE_WIDTH, rawNewWidth);

//     if (Math.abs(dx) > 2) {
//       hasMovedRef.current = true;
//     }

//     setWidth(newWidth);
//     localStorage.setItem(`${storageKey}-width`, String(newWidth));
//   }, [side, storageKey]);

//   const toggleCollapse = useCallback(() => {
//     const newState = !isCollapsed;
//     setIsCollapsed(newState);
//     localStorage.setItem(`${storageKey}-collapsed`, String(newState));
//     console.log(newState, "IS NEW collapsed state for ", storageKey)

//     if (!newState) {
//       // if uncollapsing
//       const stored = localStorage.getItem(`${storageKey}-width`);
//       setWidth(stored ? parseInt(stored, 10) : PANEL_EDGE_WIDTH);
//     } else {
//       //localStorage.setItem(`${storageKey}-width`, String(width));
//       setWidth(PANEL_EDGE_WIDTH);
//     }
//   }, [isCollapsed, storageKey]);

//   const handleMouseUp = useCallback(() => {
//     if (isDraggingRef.current) {
//       isDraggingRef.current = false;
//       document.body.style.userSelect = "";

//       if (!hasMovedRef.current && !isCollapsed && width <= PANEL_EDGE_WIDTH + 2) {
//         console.log("YOU ARE TOGGLING OMG")
//         toggleCollapse();
//       }
//     }
//   }, [isCollapsed, width, toggleCollapse]);

//   useEffect(() => {
//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseup", handleMouseUp);
//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [handleMouseMove, handleMouseUp]);

//   return (
//     <div
//       className={`${styles.sidebar} ${styles[side]}`}
//       style={{
//         width: `${width}px`,
//         minWidth: `${PANEL_EDGE_WIDTH}px`,
//       }}
//     >
//       <div className={styles.resizer} onMouseDown={handleMouseDown}>
//         <Tooltip text={isCollapsed ? `Show ${title}` : `Hide ${title}`}>
//           <button
//             className={styles.toggleButton}
//             onClick={toggleCollapse}
//             aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
//           >
//             <CollapseIcon
//               size={PANEL_EDGE_WIDTH}
//               direction={
//                 side === "left"
//                   ? isCollapsed ? "left" : "right"
//                   : isCollapsed ? "right" : "left"
//               }
//             />
//           </button>
//         </Tooltip>
//       </div>

//       {!isCollapsed && (
//         <div className={styles.content}>
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

// export default React.memo(ResizableSidebar);

import React, { useRef, useCallback, useEffect } from "react";
import styles from "./ResizableSidebar.module.css";
import Tooltip from "../tooltips/Tooltip";
import CollapseIcon from "../icons/CollapseIcon";
import { PANEL_EDGE_WIDTH } from "../../constants/editorConstants";
import type { PanelSide } from "../../hooks/useResizablePanels";
import { useResizablePanels } from "../../hooks/ResizableContext";

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

