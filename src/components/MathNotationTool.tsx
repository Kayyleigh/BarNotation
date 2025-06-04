import React, { useState, useEffect, useRef } from "react";
import HotkeyOverlay from "./HotkeyOverlay"; 
import HeaderBar from "./HeaderBar";
import "../styles/themes.css"; // includes theme classes (i.e. dark mode)
import "../styles/styles.css"; // styling for the main app
import "../styles/math-node.css"; // styling for the main app
import "../styles/cells.css"; // styling for the main app
import MathCell from "./MathCell";
import TextCell from "./TextCell";
import InsertCellButtons from "./InsertCellButtons";

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mathEditorTheme") === "dark";
  });

  const [showHotkeys, setShowHotkeys] = useState(false);

  const [isPreviewMode, setIsPreviewMode] = useState(() => {
    return localStorage.getItem("previewMode") === "on";
  });

  // Use a simple number state to trigger reset zooms
  const [resetZoomSignal, setResetZoomSignal] = useState(0);

  // Load defaultZoom from localStorage or fallback to 1
  const [defaultZoom, setDefaultZoom] = useState(() => {
    const stored = localStorage.getItem("defaultZoom");
    return stored ? parseFloat(stored) : 1;
  });

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

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    document.body.classList.toggle("on", isPreviewMode);
    localStorage.setItem("previewMode", isPreviewMode ? "on" : "off");
  }, [isPreviewMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleHotkeyOverlay = () => setShowHotkeys(prev => !prev);
  const togglePreviewMode = () => setIsPreviewMode(prev => !prev);

  const [cells, setCells] = useState<Array<{ id: string; type: "math" | "text"; content: string }>>([
    { id: "1", type: "math", content: "" },
  ]);

  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);


  const updateCellContent = (id: string, newContent: string) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, content: newContent } : cell
      )
    );
  };

  const addCell = (
    type: "math" | "text",
    index?: number
  ) => {
    const newCell = { id: Date.now().toString(), type, content: "" };
    setCells((prev) => {
      if (index === undefined || index < 0 || index > prev.length) {
        // Append to end
        return [...prev, newCell];
      } else {
        // Insert at specific index
        return [...prev.slice(0, index), newCell, ...prev.slice(index)];
      }
    });
  };
  
  const deleteCell = (id: string) => {
    setCells((prev) => prev.filter((cell) => cell.id !== id));
  };  

  return (
    <div className="app-container">
      <HeaderBar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        showHotkeys={showHotkeys}
        toggleHotkeyOverlay={toggleHotkeyOverlay}
        isPreviewMode={isPreviewMode}
        togglePreviewMode={togglePreviewMode}
        resetAllZooms={resetAllZooms}
        defaultZoom={defaultZoom}
        setShowZoomDropdown={setShowZoomDropdown}
        showZoomDropdown={showZoomDropdown}
        handleZoomChange={handleZoomChange}
        dropdownRef={dropdownRef}
        onAddCell={addCell}
      />

      <main className="editor-layout">
        <div className="cell-list">
        {cells.map((cell, index) => (
          <React.Fragment key={cell.id}>
            <div
              className="insert-zone"
              onMouseEnter={() => setHoveredInsertIndex(index)}
              onMouseLeave={() => setHoveredInsertIndex(null)}
            >
              <InsertCellButtons
                onInsert={(type) => addCell(type, index)}
                isVisible={hoveredInsertIndex === index}
              />
            </div>

          {cell.type === "math" ? (
            <MathCell
              key={cell.id}
              resetZoomSignal={resetZoomSignal}
              defaultZoom={defaultZoom}
              onDelete={() => deleteCell(cell.id)}
              isPreviewMode={isPreviewMode}
              // pass content & onChange if MathCell supports editing content
            />
          ) : (
            <TextCell
              key={cell.id}
              value={cell.content}
              onChange={(val) => updateCellContent(cell.id, val)}
              placeholder="Enter text here..."
              onDelete={() => deleteCell(cell.id)}
              isPreviewMode={isPreviewMode}
            />
          )}
          </React.Fragment>
          )
        )}
        </div>

        {/* Insert buttons at end */}
        <div
          className="insert-zone"
          onMouseEnter={() => setHoveredInsertIndex(cells.length)}
          onMouseLeave={() => setHoveredInsertIndex(null)}
        >
          <InsertCellButtons
            onInsert={(type) => addCell(type)}
            isVisible={hoveredInsertIndex === cells.length}
          />
        </div>

      </main>

      {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
    </div>
  );
};

export default App;