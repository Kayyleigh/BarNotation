// components/editor/cells/textCell/TextCellToolbar.tsx
import React from "react";
import clsx from "clsx";
import styles from "../../Editor.module.css";
import textStyles from "../../../../styles/textStyles.module.css";
import type { TextToolbarExtrasProps } from "../../../../models/cellRegistry";
import { TEXT_CELL_TYPES } from "../../../../models/textTypes";

export const TextCellToolbar: React.FC<TextToolbarExtrasProps> = React.memo(({ role, updateRole, t }) => {
  return (
    <div className={styles.hierarchyTypeButtons}>
      {Object.values(TEXT_CELL_TYPES).map((typeOption) => (
        <button
          key={typeOption}
          type="button"
          className={clsx(
            styles.hierarchyTypeButton,
            textStyles[typeOption],
            { [styles.active]: role === typeOption }
          )}
          onClick={() => updateRole(typeOption)}
          title={t(`cellRow.${typeOption}`)}
        >
          A
        </button>
      ))}
    </div>
  );
});
