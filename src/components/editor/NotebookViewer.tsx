import React from "react";
import styles from "./Editor.module.css";
import type { CellData, MathCellData, NoteMetadata, TextCellData } from "../../models/noteTypes";
import Tooltip from "../tooltips/Tooltip";
import { useI18n } from "../../i18n/useI18n";
import NoteMetadataViewer from "./noteMetadata/NoteMetadataViewer";
import { cellRegistry, type CellType } from "../../models/cellRegistry";
import { computeDisplayNumbers } from "../../utils/noteUtils";
import clsx from "clsx";

function getRegistryEntry<T extends CellType>(type: T): typeof cellRegistry[T] {
  return cellRegistry[type];
}

interface NotebookViewerProps {
  cells: CellData[];
  metadata: NoteMetadata;
}

const NotebookViewer: React.FC<NotebookViewerProps> = ({ cells, metadata }) => {
  const { t } = useI18n();

  // Only text cells need display numbers
  const textCells = cells.filter((c): c is Extract<CellData, { type: "text" }> => c.type === "text");
  const displayNumbers = computeDisplayNumbers(
    Object.fromEntries(textCells.map(c => [c.id, c.content])),
    textCells.map(c => c.id)
  );

  return (
    <main className={clsx(styles.editorLayout, styles.locked)}>
      <NoteMetadataViewer metadata={metadata} />

      <div className={styles.cellList}>
        {cells.length === 0 && <div className={styles.emptyMessage}>This note is empty.</div>}
        {cells.map((cell) => {
          if (cell.type === "text") {
            const textCell = cell as TextCellData;
            const registryEntry = getRegistryEntry("text");
            const LockedComponent = registryEntry.lockedComponent!;
            const props = registryEntry.getLockedProps!(textCell, { displayNumbers });
            return <LockedComponent key={textCell.id} {...props} />;
          }

          if (cell.type === "math") {
            const mathCell = cell as MathCellData;
            const registryEntry = getRegistryEntry("math");
            const LockedComponent = registryEntry.lockedComponent!;
            const props = registryEntry.getLockedProps!(mathCell);
            return <LockedComponent key={mathCell.id} {...props} />;
          }

          return null;
        })}

      </div>

      <div className={styles.lockedBadge}>
        <div className={styles.innerLockedBadge}>
          <Tooltip text={t("editor.lockedTooltip")}>🔒</Tooltip>
        </div>
      </div>
    </main>
  );
};

export default React.memo(NotebookViewer);
