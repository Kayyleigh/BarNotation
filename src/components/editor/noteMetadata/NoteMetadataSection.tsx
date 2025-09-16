// components/editor/NoteMetadataSection.tsx
import React, { useRef, useEffect } from "react";
import styles from "./NoteMetadataSection.module.css";
import { useEditorMode } from "../../../hooks/editorMode/useEditorMode";
import { useI18n } from "../../../i18n/useI18n";
import type { NoteMetadata } from "../../../models/noteTypes";

interface Props {
  metadata: NoteMetadata;
  setMetadata: (metadata: Partial<NoteMetadata>) => void;
}

const NoteMetadataSection: React.FC<Props> = ({ metadata, setMetadata }) => {
  const { editingMode } = useEditorMode(); // Only edit or preview
  const { t } = useI18n();

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const authorRef = useRef<HTMLTextAreaElement | null>(null);
  const dateRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textareas in preview
  useEffect(() => {
    if (editingMode !== "preview") return;

    const refs = [titleRef, authorRef, dateRef];
    for (const ref of refs) {
      const el = ref.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    }
  }, [editingMode, metadata.title, metadata.author, metadata.dateOrPeriod]);

  return (
    <div className={editingMode === "preview" ? styles.previewMetadataBar : styles.metadataBar}>
      <div className={editingMode === "preview" ? styles.previewTitle : styles.titleWrapper}>
        {editingMode === "preview" ? (
          <textarea
            ref={titleRef}
            rows={1}
            placeholder={t("editor.metadata.untitled")}
            value={metadata.title}
            onChange={(e) => setMetadata({ title: e.target.value })}
            className={styles.previewInputTitle}
          />
        ) : (
          <input
            type="text"
            placeholder={t("editor.metadata.untitled")}
            value={metadata.title}
            onChange={(e) => setMetadata({ title: e.target.value })}
            className={styles.titleInput}
          />
        )}
      </div>

      <div className={editingMode === "preview" ? undefined : styles.metaRow}>
        <div className={editingMode === "preview" ? styles.previewAuthor : styles.metaBox}>
          {editingMode === "preview" ? (
            <textarea
              ref={authorRef}
              rows={1}
              placeholder={t("editor.metadata.author")}
              value={metadata.author ?? ""}
              onChange={(e) => setMetadata({ author: e.target.value })}
              className={styles.previewInputAuthor}
            />
          ) : (
            <input
              type="text"
              placeholder={t("editor.metadata.author")}
              value={metadata.author ?? ""}
              onChange={(e) => setMetadata({ author: e.target.value })}
              className={styles.metaInput}
            />
          )}
        </div>
        <div className={editingMode === "preview" ? styles.previewDate : styles.metaBox}>
          {editingMode === "preview" ? (
            <textarea
              ref={dateRef}
              rows={1}
              placeholder={t("editor.metadata.date")}
              value={metadata.dateOrPeriod ?? ""}
              onChange={(e) => setMetadata({ dateOrPeriod: e.target.value })}
              className={styles.previewInputDate}
            />
          ) : (
            <input
              type="text"
              placeholder={t("editor.metadata.date")}
              value={metadata.dateOrPeriod ?? ""}
              onChange={(e) => setMetadata({ dateOrPeriod: e.target.value })}
              className={styles.metaInput}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NoteMetadataSection);
