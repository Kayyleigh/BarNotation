// components/modals/SettingsModal.tsx
import React, { useEffect } from "react";
import Modal from "./Modal";
import Tooltip from "../tooltips/Tooltip";
import styles from "./SettingsModal.module.css";
import { useI18n } from "../../i18n/useI18n"; // language hook
import { AVAILABLE_LANGUAGES } from "../../i18n/languages"; // language list

interface SettingsModalProps {
  onClose: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  showColorInPreview: boolean;
  toggleShowColorInPreview: () => void;
  authorName: string;
  setAuthorName: (name: string) => void;
  nerdMode: boolean;
  toggleNerdMode: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  theme,
  setTheme,
  showColorInPreview,
  toggleShowColorInPreview,
  authorName,
  setAuthorName,
  nerdMode,
  toggleNerdMode,
}) => {
  const { lang, setLang, t } = useI18n(); // Destructure language tools

  // Save author name to localStorage on change
  useEffect(() => {
    localStorage.setItem("defaultAuthor", authorName.trim());
  }, [authorName]);

  return (
    <Modal onClose={onClose}>
      <h2>{t("modals.settings.title")}</h2>
      <div className={styles.settingsRow}>
        <label htmlFor="theme" className={styles.label}>
          {t("modals.settings.theme")}
        </label>
        <select
          id="theme"
          className={`${styles.settingsInput} ${styles.inline}`}
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="light">☀️ {t("modals.settings.light")}</option>
          <option value="dark">🌙 {t("modals.settings.dark")}</option>
          {/* Add more as needed */}
        </select>
      </div>

      <label className={`${styles.toggleRow} ${styles.label}`}>
        <span>{t("modals.settings.showColor")}</span>
        <Tooltip text={t("modals.settings.showColorTooltip")}>
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

      <label className={`${styles.toggleRow} ${styles.label}`}>
        <span>{t("modals.settings.nerdMode")}</span>
        <Tooltip text={t("modals.settings.nerdTooltip")}>
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

      <div className={styles.settingsRow}>
        <label htmlFor="defaultAuthor" className={styles.label}>
          {t("modals.settings.defaultAuthor")}
        </label>
        <input
          id="defaultAuthor"
          type="text"
          className={`${styles.settingsInput} ${styles.inline}`}
          placeholder={t("modals.settings.authorPlaceholder")}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
      </div>

      {/* Language Selector */}
      <div className={styles.settingsRow}>
        <label htmlFor="language" className={styles.label}>
          {t("modals.settings.language")}
        </label>
        <select
          id="language"
          className={`${styles.settingsInput} ${styles.inline}`}
          value={lang}
          onChange={(e) => setLang(e.target.value as keyof typeof AVAILABLE_LANGUAGES)}
        >
          {Object.entries(AVAILABLE_LANGUAGES).map(([code, { name }]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
};

export default SettingsModal;
