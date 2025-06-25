import React from "react";
import styles from "./NoteMetadataSection.module.css";
import clsx from "clsx";

interface Props {
  metadata: {
    title: string;
    courseCode?: string;
    author?: string;
    dateOrPeriod?: string;
  };
  setMetadata: React.Dispatch<React.SetStateAction<{
    title: string;
    courseCode?: string;
    author?: string;
    dateOrPeriod?: string;
  }>>;
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
          onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
          className={styles.titleInput}
        />
      </div>

      <div className={styles.metaRow}>
        <div className={styles.metaBox}>
          <input
            type="text"
            placeholder="Course Code"
            value={metadata.courseCode}
            onChange={(e) => setMetadata((prev) => ({ ...prev, courseCode: e.target.value }))}
            className={styles.metaInput}
          />
        </div>
        <div className={styles.metaBox}>
          <input
            type="text"
            placeholder="Author"
            value={metadata.author}
            onChange={(e) => setMetadata((prev) => ({ ...prev, author: e.target.value }))}
            className={styles.metaInput}
          />
        </div>
        <div className={styles.metaBox}>
          <input
            type="text"
            placeholder="Date or Period"
            value={metadata.dateOrPeriod}
            onChange={(e) => setMetadata((prev) => ({ ...prev, dateOrPeriod: e.target.value }))}
            className={styles.metaInput}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteMetaDataSection;
