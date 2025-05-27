import React, { useState, useEffect } from "react";
import MathEditor from "./MathEditor";
import Toolbar from "./Toolbar";
import "../styles/styles.css"; // Make sure it includes theme classes

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mathEditorTheme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <div className="app-container">
      <header className="app-header">
        <button onClick={toggleDarkMode} className="theme-toggle-button">
          {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </header>

      <main className="editor-layout">
        <Toolbar />
        <MathEditor />
      </main>
    </div>
  );
};

export default App;
