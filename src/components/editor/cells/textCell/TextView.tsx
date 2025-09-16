import React from "react";
import clsx from "clsx";
import styles from "../cell.module.css";
import textStyles from "../../../../styles/textStyles.module.css";
import type { TextCellContent } from "../../../../models/noteTypes";

interface TextViewProps {
  content: TextCellContent;
  displayNumber: string;
}

const TextView: React.FC<TextViewProps> = ({ content, displayNumber }) => {
  const textClass = clsx(styles.preview, textStyles[content.type]);

  return (
    <div className={styles.textCellWrapper}>
      <div className={clsx(styles.displayNumber, textClass)}>{displayNumber}</div>
      <div className={textClass}>{content.text}</div>
    </div>
  );
};

export default React.memo(TextView);
