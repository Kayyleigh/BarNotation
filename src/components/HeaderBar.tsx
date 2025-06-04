import clsx from "clsx";
import React from "react";

interface HeaderBarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showHotkeys: boolean;
  toggleHotkeyOverlay: () => void;
  isPreviewMode: boolean;
  togglePreviewMode: () => void;
  resetAllZooms: () => void;
  defaultZoom: number;
  setShowZoomDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showZoomDropdown: boolean;
  handleZoomChange: (value: number) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  isDarkMode,
  toggleDarkMode,
  toggleHotkeyOverlay,
  isPreviewMode,
  togglePreviewMode,
  resetAllZooms,
  defaultZoom,
  setShowZoomDropdown,
  showZoomDropdown,
  handleZoomChange,
  dropdownRef,
}) => {
  return (
    <header className="app-header sticky-header">
      <button onClick={() => console.log("placeholder for button 1")} className={clsx("button")}>
        + Math Cell
      </button>
      <button onClick={() => console.log("placeholder for button 2")} className={clsx("button")}>
        + Text Cell
      </button>
      <button onClick={() => console.log("placeholder for button 3")} className={clsx("button")}>
        🧹 Clean
      </button>
      <button onClick={() => console.log("placeholder for button 4")} className={clsx("button")}>
        🙈 Hide LaTeX
      </button>

      {/* <button onClick={toggleDarkMode} className={clsx("button", "theme-toggle-button")}>
        {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button> */}
      <button onClick={toggleHotkeyOverlay} className={clsx("button", "hotkey-button")}>
        ⌨️ Hotkeys
      </button>
      <button onClick={togglePreviewMode} className={clsx("button", "preview-toggle-button")}>
        {isPreviewMode ? "✏️ Edit" : "📖 Preview"}
      </button>
      <button onClick={resetAllZooms} className={clsx("button", "zoom-button")}>
        ⛶ Reset Zoom
      </button>

      <div className="zoom-dropdown-wrapper" ref={dropdownRef}>
        <button
          onClick={() => setShowZoomDropdown((v) => !v)}
          className={clsx("button", "zoom-dropdown-toggle")}
        >
          <span>
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
            </div>
          </div>
        )}
      </div>
      <button onClick={() => console.log("placeholder for settings button")} className={clsx("button")}>
        ⚙️ Settings
      </button>
    </header>
  );
};

export default HeaderBar;
