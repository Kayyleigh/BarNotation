import React, { useRef, useEffect, useState } from "react";

interface MathLibraryProps {
  width: number;
  onWidthChange: (width: number) => void;
}

const COLLAPSED_WIDTH = 12; // Thickness of the edge when fully collapsed
const MIN_WIDTH = 150;
const MAX_WIDTH = typeof window !== "undefined" ? window.innerWidth : 1200;

const MathLibrary: React.FC<MathLibraryProps> = ({ width, onWidthChange }) => {
  const isDraggingRef = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(width <= COLLAPSED_WIDTH);

  // Update collapsed state if width changes externally
  useEffect(() => {
    setIsCollapsed(width <= COLLAPSED_WIDTH);
  }, [width]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = startX - e.clientX; // Dragging left increases width
      const newWidth = Math.min(MAX_WIDTH, Math.max(COLLAPSED_WIDTH, startWidth + dx));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      onWidthChange(MIN_WIDTH);
    } else {
      onWidthChange(COLLAPSED_WIDTH);
    }
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      style={{
        width,
        minWidth: COLLAPSED_WIDTH,
        maxWidth: MAX_WIDTH,
        borderLeft: "1px solid #ccc",
        background: "#f0f0ff",
        position: "relative",
        userSelect: isDraggingRef.current ? "none" : "auto",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Resizer / Collapse Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          cursor: "ew-resize",
          zIndex: 10
        }}
      />

      {/* Toggle Collapse Button */}
      <button
        onClick={toggleCollapse}
        style={{
          position: "absolute",
          left: 6,
          top: 10,
          zIndex: 11,
          background: "#ddd",
          border: "1px solid #aaa",
          borderRadius: "4px",
          padding: "2px 6px",
          fontSize: "0.8rem",
          cursor: "pointer"
        }}
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? "⟩" : "⟨"}
      </button>

      {!isCollapsed && (
        <div style={{ padding: "1rem" }}>
          <h3>Math Library (WIP)</h3>
          <p>This is where math snippets or tools will go.</p>
        </div>
      )}
    </div>
  );
};

export default MathLibrary;
