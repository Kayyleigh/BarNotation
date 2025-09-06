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
  onAddCell: (type: "math" | "text") => void;
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
  onAddCell,
}) => {
  const { t } = useI18n(); // use language hook

  const { mode, togglePreview, toggleLocked } = useEditorMode();

  const [editingZoom, setEditingZoom] = useState(false);
  const [editingZoomValue, setEditingZoomValue] = useState(defaultZoom * 100);

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
        <Tooltip text={t("editor.addMath")}>
          <button onClick={() => onAddCell("math")} className={styles.button}>
            ➕ {t("editor.math")}
          </button>
        </Tooltip>

        <Tooltip text={t("editor.addText")}>
          <button onClick={() => onAddCell("text")} className={styles.button}>
            ➕ {t("editor.text")}
          </button>
        </Tooltip>

        <Tooltip text={t("editor.showLatex")}>
          <button
            onClick={() => {
              showAllLatex();
              triggerLatexRefresh();
            }}
            className={styles.button}
          >
            👁️ LaTeX
          </button>
        </Tooltip>

        <Tooltip text={t("editor.hideLatex")}>
          <button onClick={hideAllLatex} className={styles.button}>
            🙈 LaTeX
          </button>
        </Tooltip>

        <Tooltip text={mode === "edit" ? t("editor.enterPreview") : t("editor.returnEdit")}>
          <button
            onClick={togglePreview}
            className={clsx(styles.button, styles.previewToggleButton)}
          >
            {mode === "edit" ? "📜 " + t("editor.preview") : "✏️ " + t("editor.edit")}
          </button>
        </Tooltip>

        {(mode === "preview" || mode === "locked") && (
          <Tooltip text={mode === "locked" ? t("editor.unlock") : t("editor.lock")}>
            <button
              onClick={toggleLocked}
              className={clsx(styles.button, styles.previewToggleButton)}
            >
              {mode === "locked" ? "🔓 " + t("editor.unlock") : "🔒 " + t("editor.lock")}
            </button>
          </Tooltip>
        )}

        <div className={styles.zoomControlsGroup}>
          <Tooltip text={t("editor.resetZoom")}>
            <button
              onClick={resetAllZooms}
              className={clsx(styles.button, styles.zoomButton, styles.resetZoomButton)}
              onDoubleClick={(e) => {
                e.preventDefault();
                setEditingZoom(true);
              }}
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
            <Tooltip text={t("editor.changeZoom")}>
              <button
                onClick={() => setShowZoomDropdown((v) => !v)}
                className={clsx(styles.button, styles.zoomButton, styles.zoomDropdownButton)}
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
