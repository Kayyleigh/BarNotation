// // components/modals/EditCustomCommandOnEntryModal.tsx
// import React, { useState, useEffect } from "react";
// import Modal from "./Modal";
// import styles from "./SettingsModal.module.css"; // reuse same styling for now
// import { useI18n } from "../../i18n/useI18n";
// import type { LibraryEntry } from "../../models/libraryTypes";
// import { MAX_CUSTOM_COMMAND_LENGTH } from "../../constants/editorConstants";
// import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";
// import Tooltip from "../tooltips/Tooltip";
// import MathView from "../mathExpression/MathView";

// interface EditCommandModalProps {
//   entry: LibraryEntry;
//   onSave: (command: string | undefined) => void;
//   onClose: () => void;
// }

// const EditCustomCommandOnEntryModal: React.FC<EditCommandModalProps> = ({ entry, onSave, onClose }) => {
//   const { t } = useI18n();
//   const [command, setCommand] = useState(entry.commandSequence ?? "");

//   const [isValid, setIsValid] = useState(true);
//   const [validityStatus, setValidityStatus] = useState("");

//   const { commandMap } = useCustomCommands();

//   // Autofocus when modal opens
//   useEffect(() => {
//     const input = document.getElementById("commandInput") as HTMLInputElement | null;
//     input?.focus();
//   }, []);

//   useEffect(() => {
//     if (command.length === 0) {
//       setIsValid(true);
//       setValidityStatus("command will be cleared");
//       return;
//     }

//     if (command.length > MAX_CUSTOM_COMMAND_LENGTH) {
//       setIsValid(false);
//       setValidityStatus("too long"); //TODO make little red text under input field
//       return;
//     }

//     const entryWithCommand = Object.values(commandMap).find((e) => e.commandSequence === command)

//     if (entryWithCommand && entryWithCommand !== entry) {
//       setIsValid(false);
//       setValidityStatus("already exists"); //TODO
//       return;
//     }

//     setIsValid(true);
//     setValidityStatus("Valid");

//   }, [command, command.length, commandMap, entry, entry.id]);

//   const handleSave = () => {
//     const trimmed = command.trim();
//     onSave(trimmed.length > 0 ? trimmed : undefined);
//     onClose();
//   };

//   //TODO maybe put the bust emoji in the language files
//   return (
//     <Modal onClose={onClose}>
//       <h2>👤 {t("modals.editCommand.title", { latex: entry.latex })}</h2>
//       <div className={styles.settingsRow}>
//         <input
//           id="commandInput"
//           type="text"
//           className={`${styles.settingsInput} ${styles.inline}`}
//           placeholder={t("modals.editCommand.placeholder")}
//           value={command}
//           onChange={(e) => setCommand(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" && isValid) handleSave();
//           }}
//         />
//         <Tooltip text={entry.latex}>
//           <MathView node={entry.node} showPlaceHolder={true} />
//         </Tooltip>
//       </div>

//       <div className={styles.settingsRow}>
//         <span>{isValid ? "YES" : "NO"}, {validityStatus}</span>
//       </div>

//       <div className={styles.settingsRow}>
//         <button onClick={handleSave} className={styles.settingsInput} disabled={!isValid}>
//           {t("modals.save")}
//         </button>
//         <button onClick={onClose} className={styles.settingsInput}>
//           {t("modals.cancel")}
//         </button>
//       </div>
//     </Modal>
//   );
// };

// export default EditCustomCommandOnEntryModal;

import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import styles from "./EditCustomCommandOnEntryModal.module.css"; // reuse same styling for now
import { useI18n } from "../../i18n/useI18n";
import type { LibraryEntry } from "../../models/libraryTypes";
import { MAX_CUSTOM_COMMAND_LENGTH } from "../../constants/editorConstants";
import { useCustomCommands } from "../../hooks/customCommands/useCustomCommands";
import Tooltip from "../tooltips/Tooltip";
import MathView from "../mathExpression/MathView";
import clsx from "clsx";
import { specialSequences } from "../../models/specialSequences";

interface EditCommandModalProps {
  entry: LibraryEntry;
  onSave: (command: string | undefined) => void;
  onClose: () => void;
}

export type CommandEditStatus =
  | "valid"
  | "invalid"
  | "willClear"
  | "unchanged";

export const CommandEditStatuses = {
  Valid: "valid",
  Invalid: "invalid",
  WillClear: "willClear",
  Unchanged: "unchanged",
} as const;

const EditCustomCommandOnEntryModal: React.FC<EditCommandModalProps> = ({
  entry,
  onSave,
  onClose,
}) => {
  const { t } = useI18n();
  const { commandMap } = useCustomCommands();

  const [inputValue, setInputValue] = useState<string>(
    entry.commandSequence ?? ""
  );
  const [statusReason, setStatusReason] = useState<string | null>(null);

  const hadCommandInitially = useMemo(
    () => !!entry.commandSequence,
    [entry.commandSequence]
  );

  useEffect(() => {
    const input = document.getElementById(
      "commandInput"
    ) as HTMLInputElement | null;
    input?.focus();
    if (input) {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }, []);

  const status: CommandEditStatus = useMemo(() => {
    const trimmed = inputValue.trim();

    if (!trimmed && !hadCommandInitially) {
      setStatusReason(null);
      return CommandEditStatuses.Unchanged;
    }

    if (!trimmed && hadCommandInitially) {
      setStatusReason(
        t("modals.editCommand.statusLabel.willClear") || "Command will be cleared"
      );
      return CommandEditStatuses.WillClear;
    }

    if (trimmed.length > MAX_CUSTOM_COMMAND_LENGTH) {
      setStatusReason(
        t("modals.editCommand.statusLabel.tooLong", {
          max: MAX_CUSTOM_COMMAND_LENGTH,
        }) || `Too long (max ${MAX_CUSTOM_COMMAND_LENGTH})`
      );
      return CommandEditStatuses.Invalid;
    }

    if (/\s/.test(trimmed)) {
      setStatusReason(
        t("modals.editCommand.statusLabel.containsSpaces") ||
        "Commands may not contain spaces"
      );
      return CommandEditStatuses.Invalid;
    }

    // real-time duplicate detection
    const existing = Object.values(commandMap).find(
      (cmd) => cmd.commandSequence === trimmed && cmd.id !== entry.id
    );

    if (existing) {
      setStatusReason(
        t("modals.editCommand.statusLabel.alreadyExists", {
          existingLatex: existing.latex ?? "",
        }) || "This command is already assigned to another entry"
      );
      return CommandEditStatuses.Invalid;
    }

    // ALSO check premade / special sequences
    const isReserved = specialSequences.some(
      (seq) => seq.sequence.slice(1).trim() === trimmed
    );

    if (isReserved) {
      setStatusReason(
        t("modals.editCommand.statusLabel.reserved") ||
        "This command is already reserved as a built-in sequence"
      );
      return CommandEditStatuses.Invalid;
    }

    setStatusReason(t("modals.editCommand.statusLabel.valid") || "Valid");
    return CommandEditStatuses.Valid;
  }, [inputValue, hadCommandInitially, commandMap, entry.id, t]);

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (status === CommandEditStatuses.Valid) {
      onSave(trimmed);
      onClose();
    } else if (status === CommandEditStatuses.WillClear) {
      onSave(undefined);
      onClose();
    }
  };

  const canSave =
    status === CommandEditStatuses.Valid ||
    status === CommandEditStatuses.WillClear;

  return (
    <Modal onClose={onClose}>
      <h2>
        👤{" "}
        {t("modals.editCommand.title") ??
          `Edit Custom Command`}
      </h2>

      <div className={styles.settingsRow}>
        <div className={styles.inputAreaRow}>
          {/* Input area */}
          <div className={styles.inputArea}>
            <label htmlFor="commandInput" className={styles.inputLabel}>
              {t("modals.editCommand.label") ?? "Command"}
            </label>

            <div
              className={clsx(
                styles.commandInputWrapper,
                status === CommandEditStatuses.Valid && styles.borderValid,
                status === CommandEditStatuses.Invalid && styles.borderInvalid,
                status === CommandEditStatuses.WillClear && styles.borderWillClear,
                status === CommandEditStatuses.Unchanged && styles.borderUnchanged
              )}
            >
              <span className={styles.commandPrefix} aria-hidden>
                {"\\"}
              </span>

              <input
                id="commandInput"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className={clsx(styles.commandInput, {
                  [styles.invalidInput]: status === CommandEditStatuses.Invalid,
                  [styles.validInput]: status === CommandEditStatuses.Valid,
                })}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  t("modals.editCommand.placeholder") ??
                  "Type command (without backslash)"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSave) {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === "Escape") {
                    onClose();
                  }
                }}
                aria-invalid={status === CommandEditStatuses.Invalid}
                aria-describedby="command-status"
              />
            </div>

            <div id="command-status" className={styles.commandStatusRow}>
              <div className={styles.statusMessageGroup}>
                {status === CommandEditStatuses.Valid && (
                  <span className={styles.statusValid} aria-hidden>
                    ✅{" "}
                    {t("modals.editCommand.statusLabel.valid") ?? "Will save"}
                  </span>
                )}
                {status === CommandEditStatuses.Invalid && (
                  <span className={styles.statusInvalid} aria-hidden>
                    ❌{" "}
                    {statusReason ??
                      t("modals.editCommand.statusLabel.invalid") ??
                      "Invalid"}
                  </span>
                )}
                {status === CommandEditStatuses.WillClear && (
                  <span className={styles.statusInfo} aria-hidden>
                    ℹ️{" "}
                    {statusReason ??
                      t("modals.editCommand.statusLabel.willClear") ??
                      "Will be cleared"}
                  </span>
                )}
                {status === CommandEditStatuses.Unchanged &&
                  hadCommandInitially && (
                    <span className={styles.statusInfo} aria-hidden>
                      {t("modals.editCommand.statusLabel.unchanged") ??
                        "No changes"}
                    </span>
                  )}
                {status === CommandEditStatuses.Unchanged &&
                  !hadCommandInitially && (
                    <span className={styles.statusInfo} aria-hidden />
                  )}
              </div>

              <div className={styles.charInfo}>
                <Tooltip
                  text={
                    t("modals.editCommand.charLimitTooltip") ??
                    "Max length for display reasons."
                  }
                >
                  <div className={styles.charCounter}>
                    {`${inputValue.length}/${MAX_CUSTOM_COMMAND_LENGTH}`}
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Arrow box */}
          <div className={styles.arrowBox} aria-hidden>
            <div className={styles.arrowInner}>➜</div>
          </div>

          {/* Math preview */}
          <div className={styles.mathPreview}>
            <div className={styles.mathPreviewBox}>
              <Tooltip text={entry.latex}>
                <MathView node={entry.node} showPlaceHolder={true} />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={clsx(styles.saveButton, !canSave && styles.saveButtonDisabled)}
        >
          {t("modals.save") ?? "Save"}
        </button>

        <button onClick={onClose} className={styles.cancelButton}>
          {t("modals.cancel") ?? "Cancel"}
        </button>
      </div>
    </Modal>
  );
};

export default EditCustomCommandOnEntryModal;
