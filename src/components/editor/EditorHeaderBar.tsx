// // Header bar for notation editor pane
// import clsx from "clsx";
// import React from "react";
// import Tooltip from "../tooltips/Tooltip";
// import { useToast } from "../../hooks/useToast";

// interface EditorHeaderBarProps {
//   isPreviewMode: boolean;
//   togglePreviewMode: () => void;
//   defaultZoom: number;
//   resetAllZooms: () => void;
//   showAllLatex: () => void;
//   hideAllLatex: () => void;
//   handleZoomChange: (value: number) => void;
//   showZoomDropdown: boolean;
//   setShowZoomDropdown: React.Dispatch<React.SetStateAction<boolean>>;
//   dropdownRef: React.RefObject<HTMLDivElement | null>;
//   onAddCell: (type: "math" | "text") => void;
// }

// const EditorHeaderBar: React.FC<EditorHeaderBarProps> = ({
//   isPreviewMode,
//   togglePreviewMode,
//   defaultZoom,
//   resetAllZooms,
//   showAllLatex,
//   hideAllLatex,
//   handleZoomChange,
//   showZoomDropdown,
//   setShowZoomDropdown,
//   dropdownRef,
//   onAddCell,
// }) => {
//   const { showToast } = useToast();

//   return (
//     <div className="editor-header-bar">
//       <div className="button-bar">
//         <Tooltip text="Add math cell">
//           <button onClick={() => onAddCell("math")} className={clsx("button")}>
//             ➕ Math
//           </button>
//         </Tooltip>

//         <Tooltip text="Add text cell">
//           <button onClick={() => onAddCell("text")} className={clsx("button")}>
//             ➕ Text
//           </button>
//         </Tooltip>

//         <Tooltip text="Remove empty cells">
//           <button onClick={() => showToast({ message: `Cleanup is not yet implemented`, type: "warning" })} className={clsx("button")}>
//             🧹 Clean
//           </button>
//         </Tooltip>

//         <Tooltip text="Show all LaTeX">
//           <button onClick={showAllLatex} className={clsx("button")}>
//             👁️ LaTeX
//           </button>
//         </Tooltip>

//         <Tooltip text="Hide all LaTeX">
//           <button onClick={hideAllLatex} className={clsx("button")}>
//             🙈 LaTeX
//           </button>
//         </Tooltip>

//         <Tooltip text={isPreviewMode ? "Return to edit mode" : "Enter preview mode"}>
//           <button onClick={togglePreviewMode} className={clsx("button", "preview-toggle-button")}>
//               {isPreviewMode ? "✏️ Edit" : "📜 Preview"}
//           </button>
//         </Tooltip>

//         <Tooltip text="Reset all zoom levels">
//           <button onClick={resetAllZooms} className={clsx("button", "zoom-button")}>
//               ⛶   Reset Zoom
//           </button>
//         </Tooltip>

//         <div className="zoom-dropdown-wrapper" ref={dropdownRef}>
//           <Tooltip text="Change default zoom level">
//             <button
//               onClick={() => setShowZoomDropdown((v) => !v)}
//               className={clsx("button", "zoom-dropdown-toggle")}
//             >
//               <span>
//                 {showZoomDropdown ? "▴" : "▾"}
//               </span>
//             </button>
//           </Tooltip>

//           {showZoomDropdown && (
//             <div className="zoom-dropdown-panel">
//               <label>Default Zoom</label>
//               <input
//                 type="range"
//                 min="0.5"
//                 max="2"
//                 step="0.01"
//                 value={defaultZoom}
//                 onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
//               />
//               <div className="zoom-dropdown-preview">
//                 <span>{Math.round(defaultZoom * 100)}%</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditorHeaderBar;

import clsx from "clsx";
import React from "react";
import Tooltip from "../tooltips/Tooltip";
import { useToast } from "../../hooks/useToast";
import { useEditorMode } from "../../hooks/useEditorMode"; // import your custom hook

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

  return (
    <div className="editor-header-bar">
      <div className="button-bar">
        <Tooltip text="Add math cell">
          <button onClick={() => onAddCell("math")} className={clsx("button")}>
            ➕ Math
          </button>
        </Tooltip>

        <Tooltip text="Add text cell">
          <button onClick={() => onAddCell("text")} className={clsx("button")}>
            ➕ Text
          </button>
        </Tooltip>

        <Tooltip text="Remove empty cells">
          <button
            onClick={() =>
              showToast({ message: `Cleanup is not yet implemented`, type: "warning" })
            }
            className={clsx("button")}
          >
            🧹 Clean
          </button>
        </Tooltip>

        <Tooltip text="Show all LaTeX">
          <button onClick={showAllLatex} className={clsx("button")}>
            👁️ LaTeX
          </button>
        </Tooltip>

        <Tooltip text="Hide all LaTeX">
          <button onClick={hideAllLatex} className={clsx("button")}>
            🙈 LaTeX
          </button>
        </Tooltip>

        <Tooltip text={mode === "edit" ? "Enter preview mode" : "Return to edit mode"}>
          <button
            onClick={togglePreview}
            className={clsx("button", "preview-toggle-button")}
          >
            {mode === "edit" ? "📜 Preview" : "✏️ Edit"}
          </button>
        </Tooltip>

        {mode === "preview" || mode === "locked" ? (
          <Tooltip text={mode === "locked" ? "Unlock" : "Lock"}>
            <button
              onClick={toggleLocked}
              className={clsx("button", "preview-toggle-button")}
            >
              {mode === "locked" ? "🔓 Unlock" : "🔒 Lock"}
            </button>
          </Tooltip>
        ) : null}

        <Tooltip text="Reset all zoom levels">
          <button onClick={resetAllZooms} className={clsx("button", "zoom-button")}>
            ⛶ Reset Zoom
          </button>
        </Tooltip>

        <div className="zoom-dropdown-wrapper" ref={dropdownRef}>
          <Tooltip text="Change default zoom level">
            <button
              onClick={() => setShowZoomDropdown((v) => !v)}
              className={clsx("button", "zoom-dropdown-toggle")}
            >
              <span>{showZoomDropdown ? "▴" : "▾"}</span>
            </button>
          </Tooltip>

          {showZoomDropdown && (
            <div className="zoom-dropdown-panel">
              <label>Default Zoom</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={defaultZoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              />
              <div className="zoom-dropdown-preview">
                <span>{Math.round(defaultZoom * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorHeaderBar;
