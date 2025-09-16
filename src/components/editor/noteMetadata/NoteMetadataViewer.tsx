// components/editor/NoteMetadataViewer.tsx
import React from "react";
import styles from "./NoteMetadataSection.module.css";
import clsx from "clsx";
import type { NoteMetadata } from "../../../models/noteTypes";

interface Props {
  metadata: NoteMetadata;
}

const NoteMetadataViewer: React.FC<Props> = ({ metadata }) => {
  return (
    <div className={clsx(styles.metadataBar, styles.locked)}>
      <div className={styles.previewTitle}>{metadata.title}</div>
      {metadata.author && <div className={styles.previewAuthor}>{metadata.author}</div>}
      {metadata.dateOrPeriod && <div className={styles.previewDate}>{metadata.dateOrPeriod}</div>}
    </div>
  );
};

export default React.memo(NoteMetadataViewer);
