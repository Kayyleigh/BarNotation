import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n/useI18n";
import type { Note } from "../../models/noteTypes";
import Modal from "./Modal";
import styles from "./ExportLatexModal.module.css";
import {
  formatNoteToLatex,
  type LatexFormat
} from "../../utils/latexUtils/latexExportFormatters";
import Tooltip from "../tooltips/Tooltip";

const EXPORT_LATEX_PREFS_KEY = "exportLatexPreferences";

interface ExportLatexModalProps {
  note: Note;
  onClose: () => void;
}

const ExportLatexModal: React.FC<ExportLatexModalProps> = ({ note, onClose }) => {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);

  const [format, setFormat] = useState<LatexFormat>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(EXPORT_LATEX_PREFS_KEY) || "{}");
      return saved.format || "singleColumn";
    } catch {
      return "singleColumn";
    }
  });
  
  const [wrapMathEquations, setWrapMathEquations] = useState<boolean>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(EXPORT_LATEX_PREFS_KEY) || "{}");
      return saved.wrapMathEquations ?? false;
    } catch {
      return false;
    }
  });  

  const exportOptions = useMemo(() => ({ format, lang, wrapMathEquations }), [format, lang, wrapMathEquations]);

  // Raw version for copy/download
  const plainLatexContent = useMemo(() => {
    return formatNoteToLatex(note, exportOptions, false);
  }, [note, exportOptions]);

  // Styled version for preview
  const styledLatexContent = useMemo(() => {
    return formatNoteToLatex(note, exportOptions, true);
  }, [note, exportOptions]);

  const handleDownload = () => {
    const blob = new Blob([plainLatexContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${note.metadata.title || "note"}.tex`;
    link.click();
  };

  useEffect(() => {
    localStorage.setItem(
      EXPORT_LATEX_PREFS_KEY,
      JSON.stringify({ format, wrapMathEquations })
    );
  }, [format, wrapMathEquations]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainLatexContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn("Copy failed", err);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2>{t("modals.exportLatex.title")}</h2>

      <div className={styles.container}>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label htmlFor="format">{t("modals.exportLatex.formatLabel")}:</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value as LatexFormat)}
              className={styles.dropdown}
            >
              <option value="singleColumn">{t("modals.exportLatex.format.single")}</option>
              <option value="doubleColumn">{t("modals.exportLatex.format.double")}</option>
            </select>
          </div>

          <label className={`${styles.controlGroup} ${styles.checkboxLabel}`}>
            <input
              type="checkbox"
              checked={wrapMathEquations}
              onChange={(e) => setWrapMathEquations(e.target.checked)}
              className={styles.checkboxInput}
            />
            {t("modals.exportLatex.wrapEquations")}
          </label>
        </div>

        <pre className={styles.latexBox}
          dangerouslySetInnerHTML={{ __html: styledLatexContent }}
        />

        <div className={styles.buttons}>
          <Tooltip text={t("modals.exportLatex.downloadTooltip")}>
            <button
              className={styles.button}
              onClick={handleDownload}
              type="button"
            >
              ⬇️ {t("modals.exportLatex.download")}
            </button>
          </Tooltip>
          <Tooltip text={t("modals.exportLatex.downloadTooltip")}>
            <button
              className={styles.button}
              onClick={handleCopy}
              type="button"
            >
              {copied ? t("latex.copied") : t("latex.copy")}
            </button>
          </Tooltip>
        </div>
      </div>
    </Modal>
  );
};

export default ExportLatexModal;
