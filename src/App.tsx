// App.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import './styles/themes.css';
import MainLayout from "./components/layout/MainLayout";
import { ToastProvider } from "./hooks/toast/ToastProvider";
import ModalsLayer from "./components/layout/ModalsLayer";

const App: React.FC = () => {
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // const [showNotesArchive, setShowNotesArchive] = useState(false);
  const [authorName, setAuthorName] = useState(() =>
    localStorage.getItem("defaultAuthor") || ""
  );
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("mathEditorTheme") || "dark"
  );
  const [showColorInPreview, setShowColorInPreview] = useState(() =>
    localStorage.getItem("showColorInPreview") !== "false"
  );
  const [nerdMode, setNerdMode] = useState(() =>
    localStorage.getItem("nerdMode") === "true"
  );

  // Toggle functions
  const toggleShowColorInPreview = useCallback(() => setShowColorInPreview((prev) => !prev), []);
  const toggleNerdMode = useCallback(() => setNerdMode((prev) => !prev), []);

  const handleOpenSettings = useCallback(() => setShowSettings(true), []);
  const handleOpenHotkeys = useCallback(() => setShowHotkeys(true), []);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);
  const handleCloseHotkeys = useCallback(() => setShowHotkeys(false), []);
  // const handleOpenNotesArchive = useCallback(() => setShowNotesArchive(true), []);
  // const handleCloseNotesArchive = useCallback(() => setShowNotesArchive(false), []);

  const setThemeWithStorage = useCallback((newTheme: string) => {
    setTheme(prev => {
      if (prev === newTheme) return prev;
      localStorage.setItem("mathEditorTheme", newTheme);
      return newTheme;
    });
  }, []);

  const settingsProps = useMemo(() => ({
    theme,
    setTheme: setThemeWithStorage,
    showColorInPreview,
    toggleShowColorInPreview,
    authorName,
    setAuthorName,
    nerdMode,
    toggleNerdMode,
  }), [theme, setThemeWithStorage, showColorInPreview, toggleShowColorInPreview, authorName, nerdMode, toggleNerdMode]);

  useEffect(() => {
    document.documentElement.className = ""; // clear previous
    if (theme !== "light") {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <ToastProvider>
      <MainLayout
        onOpenSettings={handleOpenSettings}
        onOpenHotkeys={handleOpenHotkeys}
        authorName={authorName}
        setAuthorName={setAuthorName}
        nerdMode={nerdMode}
        theme={theme}
        showColorInPreview={showColorInPreview}
      // onOpenNotesArchive={handleOpenNotesArchive}
      />
      <ModalsLayer
        showHotkeys={showHotkeys}
        onCloseHotkeys={handleCloseHotkeys}
        showSettings={showSettings}
        onCloseSettings={handleCloseSettings}
        settingsProps={settingsProps} //Property 'setTheme' is missing in type '{ theme: string; handleThemeChange: (newTheme: string) => void; showColorInPreview: boolean; toggleShowColorInPreview: () => void; authorName: string; setAuthorName: React.Dispatch<React.SetStateAction<string>>; nerdMode: boolean; toggleNerdMode: () => void; }' but required in type '{ theme: string; setTheme: (theme: string) => void; showColorInPreview: boolean; toggleShowColorInPreview: () => void; authorName: string; setAuthorName: (name: string) => void; nerdMode: boolean; toggleNerdMode: () => void; }'.ts(2741)

      />
    </ToastProvider>
  );
};

export default App;
