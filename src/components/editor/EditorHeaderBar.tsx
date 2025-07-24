// components/editor/EditorHeaderBar.tsx
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Tooltip from "../tooltips/Tooltip";
import { useToast } from "../../hooks/toast/useToast";
import { useEditorMode } from "../../hooks/editorMode/useEditorMode";

import styles from "./EditorHeaderBar.module.css";
import { MAX_ZOOM, MIN_ZOOM } from "../../constants/editorConstants";
import { useTriggerLatexRefresh } from "../../hooks/latexViewRefresh/useLatexRefresh";

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
  const { mode, togglePreview, toggleLocked } = useEditorMode();
  const { showToast } = useToast();

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
        <Tooltip text="Add math cell">
          <button onClick={() => onAddCell("math")} className={styles.button}>
            ➕ Math
          </button>
        </Tooltip>

        <Tooltip text="Add text cell">
          <button onClick={() => onAddCell("text")} className={styles.button}>
            ➕ Text
          </button>
        </Tooltip>

        <Tooltip text="Remove empty cells">
          <button
            onClick={() =>
              showToast({ message: `Cleanup is not yet implemented`, type: "warning" })
            }
            className={styles.button}
          >
            🧹 Clean
          </button>
        </Tooltip>

        <Tooltip text="Show all LaTeX">
          <button onClick={() => {
            showAllLatex();
            triggerLatexRefresh();
          }}
          className={styles.button}>
          👁️ LaTeX
        </button>
      </Tooltip>

      <Tooltip text="Hide all LaTeX">
        <button onClick={hideAllLatex} className={styles.button}>
          🙈 LaTeX
        </button>
      </Tooltip>

      <Tooltip text={mode === "edit" ? "Enter preview mode" : "Return to edit mode"}>
        <button
          onClick={togglePreview}
          className={clsx(styles.button, styles.previewToggleButton)}
        >
          {mode === "edit" ? "📜 Preview" : "✏️ Edit"}
        </button>
      </Tooltip>

      {(mode === "preview" || mode === "locked") && (
        <Tooltip text={mode === "locked" ? "Unlock" : "Lock"}>
          <button
            onClick={toggleLocked}
            className={clsx(styles.button, styles.previewToggleButton)}
          >
            {mode === "locked" ? "🔓 Unlock" : "🔒 Lock"}
          </button>
        </Tooltip>
      )}

      <div className={styles.zoomControlsGroup}>
        <Tooltip text="Reset all zoom levels">
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
          <Tooltip text="Change default zoom level">
            <button
              onClick={() => setShowZoomDropdown((v) => !v)}
              className={clsx(styles.button, styles.zoomButton, styles.zoomDropdownButton)}
            >
              <span>{showZoomDropdown ? "▴" : "▾"}</span>
            </button>
          </Tooltip>

          {showZoomDropdown && (
            <div className={styles.zoomDropdownPanel}>
              <label>Default Zoom</label>
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
    </div >
  );
};

export default EditorHeaderBar;
