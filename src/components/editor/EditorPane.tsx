import React, { useState, useRef, useEffect } from "react";
import EditorHeaderBar from "./EditorHeaderBar";
import NotationEditor from "./NotationEditor";

// Assume you already have a CellData type elsewhere
type CellData = {
  id: string;
  type: "math" | "text";
  content: string;
};

const EditorPane: React.FC<{ noteId: string | null; style?: React.CSSProperties }> = ({
  noteId,
  style,
}) => {
  // ---- UI state (zoom, preview, dropdowns) ----
  const [isPreviewMode, setIsPreviewMode] = useState(() => {
    return localStorage.getItem("previewMode") === "on";
  });

  const [defaultZoom, setDefaultZoom] = useState(() => {
    const stored = localStorage.getItem("defaultZoom");
    return stored ? parseFloat(stored) : 1;
  });

  const [resetZoomSignal, setResetZoomSignal] = useState(0);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowZoomDropdown(false);
      }
    };

    if (showZoomDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showZoomDropdown]);

  const resetAllZooms = () => {
    setResetZoomSignal((n) => n + 1);
    localStorage.setItem("defaultZoom", String(defaultZoom));
  };

  const handleZoomChange = (value: number) => {
    const clamped = Math.max(0.5, Math.min(2, value));
    setDefaultZoom(clamped);
    localStorage.setItem("defaultZoom", clamped.toString());
    resetAllZooms();
  };

  // ---- Cell logic ----
  const [cells, setCells] = useState<CellData[]>([]);

  const addCell = (type: "math" | "text", index?: number) => {
    const newCell: CellData = {
      id: Date.now().toString(),
      type,
      content: "",
    };
    setCells((prev) => {
      if (index === undefined) return [...prev, newCell];
      return [...prev.slice(0, index), newCell, ...prev.slice(index)];
    });
  };

  return (
    <div className="editor-pane" style={style}>
      <EditorHeaderBar
        isPreviewMode={isPreviewMode}
        togglePreviewMode={() => setIsPreviewMode((p) => !p)}
        defaultZoom={defaultZoom}
        resetAllZooms={resetAllZooms}
        handleZoomChange={handleZoomChange}
        showZoomDropdown={showZoomDropdown}
        setShowZoomDropdown={setShowZoomDropdown}
        dropdownRef={dropdownRef}
        onAddCell={() => addCell("math")} // optional: expose for header buttons
      />

      <NotationEditor
        noteId={noteId}
        isPreviewMode={isPreviewMode}
        resetZoomSignal={resetZoomSignal}
        defaultZoom={defaultZoom}
        cells={cells}
        setCells={setCells}
        addCell={addCell}
      />
    </div>
  );
};

export default EditorPane;
