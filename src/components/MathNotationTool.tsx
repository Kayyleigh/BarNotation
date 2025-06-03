import React, { useState, useEffect, useRef } from "react";
import MathEditor from "./MathEditor";
import HotkeyOverlay from "./HotkeyOverlay"; 
import "../styles/themes.css"; // includes theme classes (i.e. dark mode)
import "../styles/styles.css"; // styling for the main app
import "../styles/math-node.css"; // styling for the main app

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mathEditorTheme") === "dark";
  });
  

  const [showHotkeys, setShowHotkeys] = useState(false);

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

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleHotkeyOverlay = () => setShowHotkeys(prev => !prev);

  return (
    <div className="app-container">
      <h1>Math Notation Tool</h1>
      <header className="app-header">
        <button onClick={toggleDarkMode} className="theme-toggle-button">
          {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
        <button onClick={toggleHotkeyOverlay} className="hotkey-button">
          ⌨️ Hotkeys
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
        <MathEditor 
          resetZoomSignal={resetZoomSignal}
          defaultZoom={defaultZoom}
        />
        <MathEditor 
          resetZoomSignal={resetZoomSignal}
          defaultZoom={defaultZoom}
        />
        <MathEditor 
          resetZoomSignal={resetZoomSignal}
          defaultZoom={defaultZoom}
        />
        <MathEditor 
          resetZoomSignal={resetZoomSignal}
          defaultZoom={defaultZoom}
        />
        <MathEditor 
          resetZoomSignal={resetZoomSignal}
          defaultZoom={defaultZoom}
        />
        <MathEditor 
          resetZoomSignal={resetZoomSignal}
          defaultZoom={defaultZoom}
        />

      </main>

      {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
    </div>
  );
};

export default App;