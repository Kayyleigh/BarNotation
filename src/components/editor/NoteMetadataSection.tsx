import React from "react";
import styles from "./NoteMetadataSection.module.css";
import clsx from "clsx";
import type { NoteMetadata } from "../../models/noteTypes";

interface Props {
  metadata: NoteMetadata;
  setMetadata: (metadata: Partial<NoteMetadata>) => void;
  isPreviewMode: boolean;
}

const NoteMetaDataSection: React.FC<Props> = ({ metadata, setMetadata, isPreviewMode }) => {
  if (isPreviewMode) { //TODO: enable editing in preview mode
    return (
      <div className={clsx(styles.metadataBar, styles.preview)}>
        <div className={styles.previewTitle}>
          {(metadata.courseCode ? metadata.courseCode + " " : "") + metadata.title}
        </div>
        {metadata.author && <div className={styles.previewAuthor}>{metadata.author}</div>}
        {metadata.dateOrPeriod && <div className={styles.previewDate}>{metadata.dateOrPeriod}</div>}
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
