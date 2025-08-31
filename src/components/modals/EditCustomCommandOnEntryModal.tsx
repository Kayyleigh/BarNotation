// components/modals/EditCustomCommandOnEntryModal.tsx
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import styles from "./SettingsModal.module.css"; // reuse same styling for now
import { useI18n } from "../../i18n/useI18n";
import type { LibraryEntry } from "../../models/libraryTypes";

interface EditCommandModalProps {
  entry: LibraryEntry;
  onSave: (command: string | undefined) => void;
  onClose: () => void;
}

const EditCustomCommandOnEntryModal: React.FC<EditCommandModalProps> = ({ entry, onSave, onClose }) => {
  const { t } = useI18n();
  const [command, setCommand] = useState(entry.commandSequence ?? "");

  // Autofocus when modal opens
  useEffect(() => {
    const input = document.getElementById("commandInput") as HTMLInputElement | null;
    input?.focus();
  }, []);

  const handleSave = () => {
    const trimmed = command.trim();
    onSave(trimmed.length > 0 ? trimmed : undefined);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2>{t("modals.editCommand.title", { latex: entry.latex })}</h2>
      <div className={styles.settingsRow}>
        <label htmlFor="commandInput" className={styles.label}>
          {t("modals.editCommand.commandLabel")}
        </label>
        <input
          id="commandInput"
          type="text"
          className={`${styles.settingsInput} ${styles.inline}`}
          placeholder={t("modals.editCommand.placeholder")}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
      </div>

      <div className={styles.settingsRow}>
        <button onClick={handleSave} className={styles.settingsInput}>
          {t("modals.common.save")}
        </button>
        <button onClick={onClose} className={styles.settingsInput}>
          {t("modals.common.cancel")}
        </button>
      </div>
    </Modal>
  );
};

export default EditCustomCommandOnEntryModal;
