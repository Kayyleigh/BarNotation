// components/editor/EditorHeaderBar.tsx
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Tooltip from "../tooltips/Tooltip";
import { useEditorMode } from "../../hooks/editorMode/useEditorMode";

import styles from "./EditorHeaderBar.module.css";
import { MAX_ZOOM, MIN_ZOOM } from "../../constants/editorConstants";
import { useTriggerLatexRefresh } from "../../hooks/latexViewRefresh/useLatexRefresh";
import { useI18n } from "../../i18n/useI18n";

interface EditorHeaderBarProps {
  defaultZoom: number;
  resetAllZooms: () => void;
  showAllLatex: () => void;
  hideAllLatex: () => void;
  handleZoomChange: (value: number) => void;
  showZoomDropdown: boolean;
  setShowZoomDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  addCellRef: React.RefObject<(type: "math" | "text", index?: number) => string>;
}

const EditorHeaderBar: React.FC<EditorHeaderBarProps> = ({
  defaultZoom,
  resetAllZooms,
  showAllLatex,
  hideAllLatex,
  handleZoomChange,
  showZoomDropdown,
  setShowZoomDropdown,
  dropdownRef,
  addCellRef,
}) => {
  const { t } = useI18n(); // use language hook

  const { editingMode, toggleEditingMode, locked, toggleLocked } = useEditorMode();

  const disableWhileLocked = locked && editingMode === "preview";

  const [editingZoom, setEditingZoom] = useState(false);
  const [editingZoomValue, setEditingZoomValue] = useState(defaultZoom * 100);

  const getTooltip = (defaultText: string) =>
    disableWhileLocked ? t("editor.cannotDoInLocked") : defaultText;

  useEffect(() => {
    if (editingZoom) {
      setEditingZoomValue(Math.round(defaultZoom * 100));
    }
  }, [editingZoom, defaultZoom]);

  const applyManualZoom = () => {
    const clamped = Math.max(MIN_ZOOM * 100, Math.min(MAX_ZOOM * 100, editingZoomValue));
    setEditingZoom(false);
    handleZoomChange(clamped / 100);
  };

  const triggerLatexRefresh = useTriggerLatexRefresh();

  return (
    <div className={styles.editorHeaderBar}>
      <div className={styles.buttonBar}>
        <Tooltip text={getTooltip(t("editor.appendMath"))}>
          <button
            className={styles.button}
            onClick={() => addCellRef.current("math")}
            disabled={disableWhileLocked}
          >
            ➕ {t("editor.math")}
          </button>
        </Tooltip>

        <Tooltip text={getTooltip(t(".appendText"))}>
          <button
            className={styles.button}
            onClick={() => addCellRef.current("text")}
            disabled={disableWhileLocked}
          >
            ➕ {t("editor.text")}
          </button>
        </Tooltip>

        <Tooltip text={getTooltip(t("editor.showLatex"))}>
          <button
            className={styles.button}
            onClick={() => {
              showAllLatex();
              triggerLatexRefresh();
            }}
            disabled={disableWhileLocked}
          >
            👁️ LaTeX
          </button>
        </Tooltip>

        <Tooltip text={getTooltip(t("editor.hideLatex"))}>
          <button
            className={styles.button}
            onClick={hideAllLatex}
            disabled={disableWhileLocked}
          >
            🙈 LaTeX
          </button>
        </Tooltip>

        <Tooltip text={editingMode === "edit" ? t("editor.enterPreview") : t("editor.returnEdit")}>
          <button
            className={clsx(styles.button, styles.previewToggleButton)}
            onClick={toggleEditingMode}
          >
            {editingMode === "edit" ? "📜 " + t("editor.preview") : "✏️ " + t("editor.edit")}
          </button>
        </Tooltip>

        {(editingMode === "preview") && (
          <Tooltip text={locked ? t("editor.unlock") : t("editor.lock")}>
            <button
              className={clsx(styles.button, styles.previewToggleButton)}
              onClick={toggleLocked}
            >
              {locked ? "🔓 " + t("editor.unlock") : "🔒 " + t("editor.lock")}
            </button>
          </Tooltip>
        )}

        <div className={styles.zoomControlsGroup}>
          <Tooltip text={getTooltip(t("editor.resetZoom"))}>
            <button
              className={clsx(styles.button, styles.zoomButton, styles.resetZoomButton)}
              onClick={resetAllZooms}
              onDoubleClick={(e) => {
                e.preventDefault();
                setEditingZoom(true);
              }}
              disabled={disableWhileLocked}
            >
              ⛶{" "}
              {editingZoom ? (
                <input
                  type="number"
                  min={MIN_ZOOM * 100}
                  max={MAX_ZOOM * 100}
                  autoFocus
                  value={Math.round(editingZoomValue)}
                  onChange={(e) => setEditingZoomValue(Number(e.target.value))}
                  onBlur={applyManualZoom}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyManualZoom();
                  }}
                  className={styles.manualZoomInput}
                />
              ) : (
                <span>{Math.round(defaultZoom * 100)}%</span>
              )}
            </button>
          </Tooltip>

          <div className={styles.zoomDropdownWrapper} ref={dropdownRef}>
            <Tooltip text={getTooltip(t("editor.changeZoom"))}>
              <button
                className={clsx(styles.button, styles.zoomButton, styles.zoomDropdownButton)}
                onClick={() => setShowZoomDropdown((v) => !v)}
                disabled={disableWhileLocked}
              >
                <span>{showZoomDropdown ? "▴" : "▾"}</span>
              </button>
            </Tooltip>

            {showZoomDropdown && (
              <div className={styles.zoomDropdownPanel}>
                <label>{t("editor.defaultZoom")}</label>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step="0.01"
                  value={defaultZoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                />
                <div className={styles.zoomDropdownPreview}>
                  <span>{Math.round(defaultZoom * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorHeaderBar;
