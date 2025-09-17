// components/editor/NoteMetadataViewer.tsx
import React from "react";
import styles from "./NoteMetadataSection.module.css";
import clsx from "clsx";
import type { NoteMetadata } from "../../../models/noteTypes";
import { getDisplayDate } from "../../../utils/noteUtils";
import { useI18n } from "../../../i18n/useI18n";

interface Props {
  metadata: NoteMetadata;
}

const NoteMetadataViewer: React.FC<Props> = ({ metadata }) => {
  const { lang } = useI18n();

  //TODO: make "show inferred date in locked mode" or something an app-wide setting (boolean). Separate from latex export version (which also needs to be implemented)

  return (
    <div className={clsx(styles.metadataBar, styles.locked)}>
      <div className={styles.previewTitle}>{metadata.title}</div>
      {metadata.author && <div className={styles.previewAuthor}>{metadata.author}</div>}
      <div className={styles.previewDate}>{getDisplayDate(metadata, lang)}</div>
    </div>
  );
};

export default React.memo(NoteMetadataViewer);
