import clsx from "clsx";
import React from "react";
import Tooltip from "../tooltips/Tooltip";

interface HeaderBarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showHotkeys: boolean;
  toggleHotkeyOverlay: () => void;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  isPreviewMode: boolean;
  togglePreviewMode: () => void;
  resetAllZooms: () => void;
  defaultZoom: number;
  setShowZoomDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showZoomDropdown: boolean;
  handleZoomChange: (value: number) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onAddCell: (type: "math" | "text") => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  toggleHotkeyOverlay,
  isPreviewMode,
  togglePreviewMode,
  setShowSettings,
  resetAllZooms,
  defaultZoom,
  setShowZoomDropdown,
  showZoomDropdown,
  handleZoomChange,
  dropdownRef,
  onAddCell,
}) => {
  return (
    <header className="app-header sticky-header">
      <div className="header-left">
        <img className="app-logo" src="src/assets/logo.svg" alt="Logo" />

        <div className="button-bar">
          <Tooltip text="Add new math cell">
            <button onClick={() => onAddCell("math")} className={clsx("button")}>
                + Math
            </button>
          </Tooltip>

          <Tooltip text="Add new text cell">
            <button onClick={() => onAddCell("text")} className={clsx("button")}>
                + Text
            </button>
          </Tooltip>

          <Tooltip text="Remove empty cells">
            <button onClick={() => console.log("placeholder for button 3")} className={clsx("button")}>
                🧹 Clean
            </button>
          </Tooltip>

          <Tooltip text="Show all LaTeX">
            <button onClick={() => console.log("placeholder for button 4")} className={clsx("button")}>
                👁️ Show LaTeX
            </button>
          </Tooltip>

          <Tooltip text="Hide all LaTeX">
            <button onClick={() => console.log("placeholder for button 4")} className={clsx("button")}>
                🙈 Hide LaTeX
            </button>
          </Tooltip>

          <Tooltip text="Show hotkey overview">
            <button onClick={toggleHotkeyOverlay} className={clsx("button", "hotkey-button")}>
              ⌨️ Hotkeys
            </button>
          </Tooltip>

          <Tooltip text="Toggle preview/edit mode">
            <button onClick={togglePreviewMode} className={clsx("button", "preview-toggle-button")}>
                {isPreviewMode ? "✏️ Edit" : "📜 Preview"}
            </button>
          </Tooltip>

          <Tooltip text="Reset all zoom levels">
            <button onClick={resetAllZooms} className={clsx("button", "zoom-button")}>
                ⛶   Reset Zoom
            </button>
          </Tooltip>

          <div className="zoom-dropdown-wrapper" ref={dropdownRef}>
            <Tooltip text="Change default zoom level">
              <button
                onClick={() => setShowZoomDropdown((v) => !v)}
                className={clsx("button", "zoom-dropdown-toggle")}
              >
                <span>
                  {showZoomDropdown ? "▴" : "▾"}
                </span>
              </button>
            </Tooltip>

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
        </div>
      </div>
      <div className="header-right">
        <Tooltip text="Change your settings">
          <button onClick={() => setShowSettings(true)} className={clsx("button")}>
              ⚙️ Settings
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default HeaderBar;
