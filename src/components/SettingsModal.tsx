import React, { useEffect, useRef } from "react";
import Tooltip from "./Tooltip";

const SettingsModal: React.FC<{ onClose: () => void; isDarkMode: boolean; toggleDarkMode: () => void }> = ({
  onClose,
  isDarkMode,
  toggleDarkMode,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
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
        <div>
          <label>Theme</label>
          <Tooltip text="Toggle theme">
            <button onClick={toggleDarkMode} className="button">
                {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </Tooltip>
        </div>

        {/* Add more settings here */}
      </div>
    </div>
  );
};

export default SettingsModal;