import { useMemo, useState } from "react";
import { useI18n } from "../../i18n/useI18n";
import type { Note } from "../../models/noteTypes";
import Modal from "./Modal";
import styles from "./ExportLatexModal.module.css";
import { formatNoteToLatex, type LatexFormat } from "../../utils/latexUtils/latexExportFormatters";

interface ExportLatexModalProps {
  note: Note;
  onClose: () => void;
}

const ExportLatexModal: React.FC<ExportLatexModalProps> = ({ note, onClose }) => {
  const { t } = useI18n();
  const [format, setFormat] = useState<LatexFormat>("singleColumn");
  const [copied, setCopied] = useState(false);

  const latexContent = useMemo(() => formatNoteToLatex(note, format), [note, format]);

  const handleDownload = () => {
    const blob = new Blob([latexContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${note.metadata.title || "note"}.tex`;
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latexContent);
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
          <label htmlFor="format">{t("modals.exportLatex.formatLabel")}:</label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as LatexFormat)}
          >
            <option value="singleColumn">{t("modals.exportLatex.format.single")}</option>
            <option value="doubleColumn">{t("modals.exportLatex.format.double")}</option>
          </select>
        </div>

        <pre className={styles.latexBox}>
          {latexContent}
        </pre>

        <div className={styles.buttons}>
          <button onClick={handleDownload}>⬇️ {t("modals.exportLatex.download")}</button>
          <button onClick={handleCopy}>
            {copied ? t("latex.copied") : t("latex.copy")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportLatexModal;