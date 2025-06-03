import React, { useState, useEffect } from "react";
import MathEditor from "./MathEditor";
import HotkeyOverlay from "./HotkeyOverlay"; 
import "../styles/themes.css"; // includes theme classes (i.e. dark mode)
import "../styles/styles.css"; // styling for the main app

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mathEditorTheme") === "dark";
  });

  const [showHotkeys, setShowHotkeys] = useState(false);

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
      </header>

      <main className="editor-layout">
        <MathEditor />
        <MathEditor />
        <MathEditor />
        <MathEditor />
        <MathEditor />
        <MathEditor />
        <MathEditor />
        <MathEditor />
        <MathEditor />
      </main>

      {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
    </div>
  );
};

export default App;