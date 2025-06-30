import React, { useState, useEffect, useRef } from "react";
import HotkeyOverlay from "../modals/HotkeyOverlay";
import HeaderBar from "./HeaderBar";
import "../styles/themes.css";
import "../styles/styles.css";
import "../styles/math-node.css";
import "../styles/cells.css";
import MathCell from "../cells/MathCell";
import TextCell from "../cells/TextCell";
import InsertCellButtons from "../cells/InsertCellButtons";
import SettingsModal from "../modals/SettingsModal";
import BaseCell from "../cells/BaseCell";
import { useCellDragState } from "../../hooks/useCellDragState";

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mathEditorTheme") === "dark";
  });

  const [showColorInPreview, setShowColorInPreview] = useState(() => {
    return localStorage.getItem("showColorInPreview") === "true";
  });

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  const {
    draggingCellId,
    dragOverInsertIndex,
    draggingCellIdRef,
    startDrag,
    updateDragOver,
    endDrag,
  } = useCellDragState();
  
  const handlePointerDown = (e: React.PointerEvent, id: string, index: number) => {
    e.preventDefault();
    startDrag(id, index);
  
    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
  
      const rects = cellRefs.current.map((ref) => ref?.getBoundingClientRect());
      const cursorY = moveEvent.clientY;
  
      const overIndex = rects.findIndex((rect) => {
        if (!rect) return false;
        return cursorY < rect.top + rect.height / 2;
      });
  
      if (draggingCellIdRef.current !== null) {
        updateDragOver(overIndex === -1 ? cells.length : overIndex);
      }
    };
  
    const handlePointerUp = () => {
      const { from, to } = endDrag();
      if (from !== null && to !== null && from !== to) {
        setCells((prev) => {
          const updated = [...prev];
          const [moved] = updated.splice(from, 1);
          const insertIndex = from < to ? to - 1 : to;
          updated.splice(insertIndex, 0, moved);
          return updated;
        });
      }
  
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const [cells, setCells] = useState<Array<{ id: string; type: "math" | "text"; content: string }>>([]);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);

  const [isPreviewMode, setIsPreviewMode] = useState(() => {
    return localStorage.getItem("previewMode") === "on";
  });

  const [resetZoomSignal, setResetZoomSignal] = useState(0);
  const [defaultZoom, setDefaultZoom] = useState(() => {
    const stored = localStorage.getItem("defaultZoom");
    return stored ? parseFloat(stored) : 1;
  });

  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleShowLatex = (cellId: string) => {
    setShowLatexMap((prev) => ({
      ...prev,
      [cellId]: !prev[cellId],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowZoomDropdown(false);
      }
    };

    if (showZoomDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showZoomDropdown]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    document.body.classList.toggle("true", showColorInPreview);
    localStorage.setItem("showColorInPreview", showColorInPreview ? "true" : "false");
  }, [showColorInPreview]);

  useEffect(() => {
    document.body.classList.toggle("on", isPreviewMode);
    localStorage.setItem("previewMode", isPreviewMode ? "on" : "off");
  }, [isPreviewMode]);

  const resetAllZooms = () => {
    setResetZoomSignal((n) => n + 1);
    localStorage.setItem("defaultZoom", String(defaultZoom));
  };

  const handleZoomChange = (value: number) => {
    const clamped = Math.max(0.5, Math.min(2, value));
    setDefaultZoom(clamped);
    localStorage.setItem("defaultZoom", clamped.toString());
    resetAllZooms();
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleShowColorInPreview = () => setShowColorInPreview(prev => !prev);
  const toggleHotkeyOverlay = () => setShowHotkeys(prev => !prev);
  const togglePreviewMode = () => setIsPreviewMode(prev => !prev);

  const updateCellContent = (id: string, newContent: string) => {
    setCells((prev) =>
      prev.map((cell) =>
        cell.id === id ? { ...cell, content: newContent } : cell
      )
    );
  };

  const addCell = (
    type: "math" | "text",
    index?: number
  ) => {
    const newCell = { id: Date.now().toString(), type, content: "" };
    setCells((prev) => {
      if (index === undefined || index < 0 || index > prev.length) {
        return [...prev, newCell];
      } else {
        return [...prev.slice(0, index), newCell, ...prev.slice(index)];
      }
    });
  };

  const deleteCell = (id: string) => {
    setCells((prev) => prev.filter((cell) => cell.id !== id));
  };

  const handleClick = (e: React.MouseEvent) => {
    // If click is outside any cell, deselect.
    // Cells have the class "cell" (in BaseCell's top div), so check if click target is inside a .cell
  
    // We can use e.target and traverse up with .closest()
    const target = e.target as HTMLElement;
    if (!target.closest(".cell")) {
      setSelectedCellId(null);
    }
  };

  return (
    <div className="app-container" onClick={handleClick}>
      <HeaderBar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        showHotkeys={showHotkeys}
        toggleHotkeyOverlay={toggleHotkeyOverlay}
        setShowSettings={setShowSettings}
        isPreviewMode={isPreviewMode}
        togglePreviewMode={togglePreviewMode}
        resetAllZooms={resetAllZooms}
        defaultZoom={defaultZoom}
        setShowZoomDropdown={setShowZoomDropdown}
        showZoomDropdown={showZoomDropdown}
        handleZoomChange={handleZoomChange}
        dropdownRef={dropdownRef}
        onAddCell={addCell}
      />

      <main className="editor-layout">
        <div className="cell-list">
          {cells.map((cell, index) => (
            <React.Fragment key={cell.id}>
              <div
                className={`insert-zone ${dragOverInsertIndex === index ? "drag-over" : ""}`}
                onMouseEnter={() => setHoveredInsertIndex(index)}
                onMouseLeave={() => setHoveredInsertIndex(null)}
                onPointerEnter={() => {
                  if (draggingCellId !== null) {
                    updateDragOver(index);
                  }
                }}
              >
                <InsertCellButtons
                  onInsert={(type) => addCell(type, index)}
                  isVisible={hoveredInsertIndex === index}
                />
              </div>

              <div
                ref={(el) => {
                  if (el) cellRefs.current[index] = el;
                }}
              >
                <BaseCell
                  key={cell.id}
                  typeLabel={cell.type === "math" ? "Math" : "Text"}
                  isSelected={selectedCellId === cell.id}
                  isPreviewMode={isPreviewMode}
                  isDragging={draggingCellId === cell.id}
                  onClick={() => setSelectedCellId(cell.id)}
                  onDelete={() => deleteCell(cell.id)}
                  handlePointerDown={(e) => handlePointerDown(e, cell.id, index)}
                  toolbarExtras={
                    cell.type === "math" ? (
                      <button className="preview-button" onClick={() => toggleShowLatex(cell.id)}>
                        {showLatexMap[cell.id] ? "🙈 Latex" : "👁️ Latex"}
                      </button>
                    ) : null
                  }
                >
                  {cell.type === "text" ? (
                    <TextCell
                      value={cell.content}
                      isPreviewMode={isPreviewMode}
                      onChange={(newValue) => updateCellContent(cell.id, newValue)}
                    />
                  ) : (
                    <MathCell
                      resetZoomSignal={resetZoomSignal}
                      defaultZoom={defaultZoom}
                      showLatex={showLatexMap[cell.id] ?? false}
                      isPreviewMode={isPreviewMode}
                    />
                  )}
                </BaseCell>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div
          className={`insert-zone ${dragOverInsertIndex === cells.length ? "drag-over" : ""}`}
          onMouseEnter={() => setHoveredInsertIndex(cells.length)}
          onMouseLeave={() => setHoveredInsertIndex(null)}
          onPointerEnter={() => {
            if (draggingCellId !== null) {
              updateDragOver(cells.length);
            }
          }}
        >
          <InsertCellButtons
            onInsert={(type) => addCell(type)}
            isVisible={isPreviewMode ? (hoveredInsertIndex === cells.length) : true}
          />
        </div>
      </main>

      {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          showColorInPreview={showColorInPreview}
          toggleShowColorInPreview={toggleShowColorInPreview}
        />
      )}
    </div>
  );
};

export default App;
