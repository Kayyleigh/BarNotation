import React, { useEffect, useRef } from "react";
import Tooltip from "../tooltips/Tooltip";
import "../../styles/settings.css";

const SettingsModal: React.FC<{
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showColorInPreview: boolean;
  toggleShowColorInPreview: () => void;
}> = ({
  onClose,
  isDarkMode,
  toggleDarkMode,
  showColorInPreview,
  toggleShowColorInPreview,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [authorName, setAuthorName] = React.useState(() => localStorage.getItem("defaultAuthor") || "");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Save author name when changed
  useEffect(() => {
    localStorage.setItem("defaultAuthor", authorName.trim());
  }, [authorName]);

  return (
    <div className="hotkey-overlay">
      <div className="hotkey-overlay-content" ref={contentRef}>
        <span className="hotkey-close-button">
          <Tooltip text="Close">
            <button className="button" onClick={onClose}>
              ✕
            </button>
          </Tooltip>
        </span>
        <h2>Settings</h2>

        <label>Theme</label>
        <Tooltip text="Toggle theme">
          <button onClick={toggleDarkMode} className="button">
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </Tooltip>

        <label className="toggle-row">
          <span>Show color in preview</span>
          <Tooltip text="Toggle color use in preview mode">
            <label className="switch">
              <input
                type="checkbox"
                checked={showColorInPreview}
                onChange={() => toggleShowColorInPreview()}
              />
              <span className="slider" />
            </label>
          </Tooltip>
        </label>

        <div className="settings-row">
          <label htmlFor="defaultAuthor">Default Author Name</label>
          <input
            id="defaultAuthor"
            type="text"
            className="settings-input inline"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>
        <div className="settings-actions">
          <Tooltip text="Apply changes and return to editor">
            <button className="button primary" onClick={onClose}>
              Apply & Close
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};


export default SettingsModal;