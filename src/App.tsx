import React, { useState, useCallback, useMemo } from "react";
import './styles/themes.css';
import MainLayout from "./components/layout/MainLayout";
import { ToastProvider } from "./components/common/ToastProvider";
import ModalsLayer from "./components/layout/ModalsLayer";

const App: React.FC = () => {
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleShowColorInPreview = () => setShowColorInPreview((prev) => !prev);
  const toggleNerdMode = () => setNerdMode((prev) => !prev);

  const handleOpenSettings = useCallback(() => setShowSettings(true), []);
  const handleOpenHotkeys = useCallback(() => setShowHotkeys(true), []);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);
  const handleCloseHotkeys = useCallback(() => setShowHotkeys(false), []);

  const settingsProps = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
      showColorInPreview,
      toggleShowColorInPreview,
      authorName,
      setAuthorName,
      nerdMode,
      toggleNerdMode,
    }),
    [isDarkMode, showColorInPreview, authorName, nerdMode]
  );

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
