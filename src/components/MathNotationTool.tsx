import React, { useState, useEffect, useRef } from "react";
import HotkeyOverlay from "./HotkeyOverlay"; 
import "../styles/themes.css"; // includes theme classes (i.e. dark mode)
import "../styles/styles.css"; // styling for the main app
import "../styles/math-node.css"; // styling for the main app
import "../styles/cells.css"; // styling for the main app
import MathCell from "./MathCell";
import TextCell from "./TextCell";

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

  const updateCellContent = (id: string, newContent: string) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, content: newContent } : cell
      )
    );
  };

  const addCell = (type: "math" | "text") => {
    setCells((prev) => [...prev, { id: Date.now().toString(), type, content: "" }]);
  };

  const deleteCell = (id: string) => {
    setCells((prev) => prev.filter((cell) => cell.id !== id));
  };  

  return (
    <div className="app-container">
      <h1>Math Notation Tool</h1>
      <header className="app-header">
        <button onClick={toggleDarkMode} className="theme-toggle-button">
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button onClick={toggleHotkeyOverlay} className="hotkey-button">
          ⌨️ Hotkeys
        </button>
        <button onClick={togglePreviewMode} className="preview-toggle-button">
          {isPreviewMode ? "✏️ Edit Mode" : "🧾 Preview Mode"}
        </button>
      
        <button onClick={resetAllZooms} className="zoom-button">
          ⛶ Reset Zoom
        </button>

        <div className="zoom-dropdown-wrapper" ref={dropdownRef}>
          <button
            onClick={() => setShowZoomDropdown((v) => !v)}
            className="zoom-dropdown-toggle"
          >
            <span style={{ marginLeft: "0.25rem" }}>
              {showZoomDropdown ? "▴" : "▾"}
            </span>
          </button>

          {showZoomDropdown && (
            <div className="zoom-dropdown-panel">
              <label>Default Zoom</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={defaultZoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              />
              <div className="zoom-dropdown-preview">
                <span>{Math.round(defaultZoom * 100)}%</span>
                {/* <span className="math-preview" style={{ fontSize: `${defaultZoom * 1.6}rem` }}>A</span> */}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="editor-layout">
        <div className="cell-list">
        {cells.map((cell) =>
          cell.type === "math" ? (
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
          )
        )}
        </div>

        <div className="add-buttons">
          <button className="math-cell-button" onClick={() => addCell("math")}>+ Math Cell</button>
          <button className="text-cell-button" onClick={() => addCell("text")}>+ Text Cell</button>
        </div>

      </main>

      {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
    </div>
  );
};

export default App;