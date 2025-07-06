import React, { useEffect, useRef } from "react";
import styles from "./NoteMetadataSection.module.css";
import clsx from "clsx";
import type { NoteMetadata } from "../../models/noteTypes";
import { useEditorMode } from "../../hooks/useEditorMode";

interface Props {
  metadata: NoteMetadata;
  setMetadata: (metadata: Partial<NoteMetadata>) => void;
}

const NoteMetaDataSection: React.FC<Props> = ({ metadata, setMetadata }) => {
  const { mode } = useEditorMode();

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const authorRef = useRef<HTMLTextAreaElement | null>(null);
  const dateRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (mode !== "preview") return;

    const refs = [titleRef, authorRef, dateRef];

    for (const ref of refs) {
      const el = ref.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    }
  }, [mode, metadata.title, metadata.author, metadata.dateOrPeriod]);

  if (mode === "locked") {
    return (
      <div className={clsx(styles.metadataBar, styles.preview, styles.locked)}>
        <div className={styles.previewTitle}>
          {(metadata.courseCode ? metadata.courseCode + " " : "") + metadata.title}
        </div>
        {metadata.author && <div className={styles.previewAuthor}>{metadata.author}</div>}
        {metadata.dateOrPeriod && <div className={styles.previewDate}>{metadata.dateOrPeriod}</div>}
      </div>
    );
  }

  if (mode === "preview") {
    return (
      <div className={clsx(styles.metadataBar, styles.preview)}>
        <div className={styles.previewTitle}>
          <textarea
            ref={titleRef}
            placeholder="Untitled Note"
            value={metadata.title}
            onChange={(e) => setMetadata({ title: e.target.value })}
            className={styles.previewInputTitle}
          />
        </div>

        {(metadata.author) && (
          <div className={styles.previewAuthor}>
            <textarea
              ref={authorRef}
              rows={1}
              placeholder="Author"
              value={metadata.author ?? ""}
              onChange={(e) => setMetadata({ author: e.target.value })}
              className={styles.previewInputAuthor}
            />
          </div>
        )}

        {(metadata.dateOrPeriod) && (
          <div className={styles.previewDate}>
            <textarea
              ref={dateRef}
              rows={1}
              placeholder="Date or Period"
              value={metadata.dateOrPeriod ?? ""}
              onChange={(e) => setMetadata({ dateOrPeriod: e.target.value })}
              className={styles.previewInputDate}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.metadataBar}>
      <div className={styles.titleWrapper}>
        <input
          type="text"
          placeholder="Untitled Note"
          value={metadata.title}
          onChange={(e) => setMetadata({ title: e.target.value })}
          className={styles.titleInput}
        />
      </div>

      <div className={styles.metaRow}>
        <div className={styles.metaBox}>
          <input
            type="text"
            placeholder="Course Code"
            value={metadata.courseCode ?? ""}
            onChange={(e) => setMetadata({ courseCode: e.target.value })}
            className={styles.metaInput}
          />
        </div>
        <div className={styles.metaBox}>
          <input
            type="text"
            placeholder="Author"
            value={metadata.author ?? ""}
            onChange={(e) => setMetadata({ author: e.target.value })}
            className={styles.metaInput}
          />
        </div>
        <div className={styles.metaBox}>
          <input
            type="text"
            placeholder="Date or Period"
            value={metadata.dateOrPeriod ?? ""}
            onChange={(e) => setMetadata({ dateOrPeriod: e.target.value })}
            className={styles.metaInput}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(NoteMetaDataSection);
