// components/modals/SettingsModal.tsx
import React, { useEffect } from "react";
import Modal from "./Modal";
import Tooltip from "../tooltips/Tooltip";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showColorInPreview: boolean;
  toggleShowColorInPreview: () => void;
  authorName: string;
  setAuthorName: (name: string) => void;
  nerdMode: boolean;
  toggleNerdMode: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isDarkMode,
  toggleDarkMode,
  showColorInPreview,
  toggleShowColorInPreview,
  authorName,
  setAuthorName,
  nerdMode,
  toggleNerdMode,
}) => {
  // Save author name to localStorage on change
  useEffect(() => {
    localStorage.setItem("defaultAuthor", authorName.trim());
  }, [authorName]);

  return (
    <Modal onClose={onClose}>
      <h2>Settings</h2>

      <label className={styles.label}>Theme</label>
      <Tooltip text="Toggle theme">
        <button onClick={toggleDarkMode} className={styles.button}>
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </Tooltip>

      <label className={`${styles.toggleRow} ${styles.label}`}>
        <span>Show color in preview</span>
        <Tooltip text="Toggle color use in preview mode">
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={showColorInPreview}
              onChange={toggleShowColorInPreview}
            />
            <span className={styles.slider} />
          </label>
        </Tooltip>
      </label>

      <div className={styles.settingsRow}>
        <label htmlFor="defaultAuthor" className={styles.label}>
          Default Author Name
        </label>
        <input
          id="defaultAuthor"
          type="text"
          className={`${styles.settingsInput} ${styles.inline}`}
          placeholder="Your name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
      </div>

      <label className={`${styles.toggleRow} ${styles.label}`}>
        <span>I am a nerd</span>
        <Tooltip text="Toggle visibility of node drag frequencies">
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={nerdMode}
              onChange={toggleNerdMode}
            />
            <span className={styles.slider} />
          </label>
        </Tooltip>
      </label>

      <div className={styles.settingsActions}>
        <Tooltip text="Apply changes and return to editor">
          <button className={`${styles.button} ${styles.primary}`} onClick={onClose}>
            Apply & Close
          </button>
        </Tooltip>
      </div>
    </Modal>
  );
};

export default SettingsModal;
