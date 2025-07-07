import React, { useState, useCallback, useMemo } from "react";
import './styles/themes.css';
import MainLayout from "./components/layout/MainLayout";
import { ToastProvider } from "./components/common/ToastProvider";
import ModalsLayer from "./components/layout/ModalsLayer";

const App: React.FC = () => {
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // const [showNotesArchive, setShowNotesArchive] = useState(false);
  const [authorName, setAuthorName] = useState(() =>
    localStorage.getItem("defaultAuthor") || ""
  );
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("mathEditorTheme") !== "light"
  );
  const [showColorInPreview, setShowColorInPreview] = useState(() =>
    localStorage.getItem("showColorInPreview") !== "false"
  );
  const [nerdMode, setNerdMode] = useState(() =>
    localStorage.getItem("nerdMode") === "true"
  );

  // Toggle functions
  const toggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), []);
  const toggleShowColorInPreview = useCallback(() => setShowColorInPreview((prev) => !prev), []);
  const toggleNerdMode = useCallback(() => setNerdMode((prev) => !prev), []);

  const handleOpenSettings = useCallback(() => setShowSettings(true), []);
  const handleOpenHotkeys = useCallback(() => setShowHotkeys(true), []);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);
  const handleCloseHotkeys = useCallback(() => setShowHotkeys(false), []);
  // const handleOpenNotesArchive = useCallback(() => setShowNotesArchive(true), []);
  // const handleCloseNotesArchive = useCallback(() => setShowNotesArchive(false), []);

  const settingsProps = useMemo(() => ({
    isDarkMode,
    toggleDarkMode,
    showColorInPreview,
    toggleShowColorInPreview,
    authorName,
    setAuthorName,
    nerdMode,
    toggleNerdMode,
  }), [isDarkMode, toggleDarkMode, showColorInPreview, toggleShowColorInPreview, authorName, nerdMode, toggleNerdMode]);
  

  return (
    <ToastProvider>
      <MainLayout
        onOpenSettings={handleOpenSettings}
        onOpenHotkeys={handleOpenHotkeys}
        authorName={authorName}
        setAuthorName={setAuthorName}
        nerdMode={nerdMode}
        isDarkMode={isDarkMode}
        showColorInPreview={showColorInPreview}
        // onOpenNotesArchive={handleOpenNotesArchive}
      />
      <ModalsLayer
        showHotkeys={showHotkeys}
        onCloseHotkeys={handleCloseHotkeys}
        showSettings={showSettings}
        onCloseSettings={handleCloseSettings}
        settingsProps={settingsProps}
      />
    </ToastProvider>
  );
};

export default App;
