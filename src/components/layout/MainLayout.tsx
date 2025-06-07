import React, { useState, useEffect } from "react";
import HeaderBar from "./MainHeaderBar";
import NotesMenu from "../notesMenu/NotesMenu";
import EditorPane from "../editor/EditorPane";
import MathLibrary from "../mathLibrary/MathLibrary";
import HotkeyOverlay from "../modals/HotkeyOverlay";
import SettingsModal from "../modals/SettingsModal";
import "../../styles/themes.css";
import "../../styles/styles.css";
import "../../styles/math-node.css";
import "../../styles/cells.css";

const MainLayout: React.FC = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(600);
  const [showSettings, setShowSettings] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);

  // === Settings state ===
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mathEditorTheme") === "dark";
  });

  const [showColorInPreview, setShowColorInPreview] = useState(() => {
    return localStorage.getItem("showColorInPreview") === "true";
  });

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleShowColorInPreview = () => setShowColorInPreview(prev => !prev);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("showColorInPreview", showColorInPreview ? "true" : "false");
  }, [showColorInPreview]);

  return (
    <div className="main-layout">
      <HeaderBar
        onOpenSettings={() => setShowSettings(true)}
        onOpenHotkeys={() => setShowHotkeys(true)}
      />

      <div className="content" style={{ display: "flex", height: "calc(100vh - 50px)" }}>
        <NotesMenu
          width={leftWidth}
          onWidthChange={setLeftWidth}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
        />

        <EditorPane
          style={{ flexGrow: 1 }}
          noteId={selectedNoteId}
        />
{/* These 2 need some interaction... Put hover state all the way up? */}
        <MathLibrary
          width={rightWidth}
          onWidthChange={setRightWidth}
        />
      </div>

      {/* Modals */}
      {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          showColorInPreview={showColorInPreview}
          toggleShowColorInPreview={toggleShowColorInPreview}
        />
      )}
    </div>
  );
};

export default MainLayout;
