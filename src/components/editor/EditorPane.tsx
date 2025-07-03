// components/editor/EditorPane.tsx
import React, { useState, useRef, useEffect } from "react";
import EditorHeaderBar from "./EditorHeaderBar";
import NotationEditor from "./NotationEditor";
import styles from "./Editor.module.css";
import type { NoteMetadata } from "../../models/noteTypes";
import { useEditorHistory } from "../../hooks/EditorHistoryContext";
import { createRootWrapper } from "../../models/nodeFactories";
import { createEditorState, type EditorState } from "../../logic/editor-state";
import type { DropSource, DropTarget } from "../layout/EditorWorkspace";

interface EditorPaneProps {
  noteId: string | null;
  noteMetadata: NoteMetadata;
  setNoteMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
  style?: React.CSSProperties;
  onDropNode: (from: DropSource, to: DropTarget) => void;
}

/** 
 * Load the editor state JSON from localStorage by noteId.
 * Returns parsed state or null if none saved yet.
 */
function loadNoteState(noteId: string) {
  try {
    const saved = localStorage.getItem(`note-editor-state-${noteId}`);
    if (!saved) return null;
    console.warn(`THIS IS ACTUALLY USED`)
    return JSON.parse(saved) as {
      order: string[];
      states: Record<string, EditorState>; // loosely typed EditorState, adjust as needed
      textContents: Record<string, string>;
    };
  } catch {
    return null;
  }
}

/** 
 * Save the editor state JSON to localStorage by noteId.
 */
function saveNoteState(
  noteId: string,
  state: {
    order: string[];
    states: Record<string, EditorState>;
    textContents: Record<string, string>;
  }
) {
  try {
    localStorage.setItem(`note-editor-state-${noteId}`, JSON.stringify(state));
  } catch {
    // ignore write errors (quota, etc)
  }
}

const EditorPane: React.FC<EditorPaneProps> = ({
  noteId,
  noteMetadata,
  setNoteMetadata,
  style,
  onDropNode,
}) => {
  const { history, updateState } = useEditorHistory();
  const { states: editorStates, order, textContents } = history.present;

  // Update textContents safely
  const setTextContents = (value: React.SetStateAction<typeof textContents>) => {
    if (typeof value === "function") {
      const newContents = value(textContents);
      updateState({ states: editorStates, order, textContents: newContents });
      if (noteId) saveNoteState(noteId, { order, states: editorStates, textContents: newContents });
    } else {
      updateState({ states: editorStates, order, textContents: value });
      if (noteId) saveNoteState(noteId, { order, states: editorStates, textContents: value });
    }
  };

  // Update editorStates safely
  const setEditorStates = (value: React.SetStateAction<typeof editorStates>) => {
    if (typeof value === "function") {
      const newStates = value(editorStates);
      updateState({ states: newStates, order, textContents });
      if (noteId) saveNoteState(noteId, { order, states: newStates, textContents });
    } else {
      updateState({ states: value, order, textContents });
      if (noteId) saveNoteState(noteId, { order, states: value, textContents });
    }
  };

  // Add a new cell (math or text) at optional index
  const addCell = (type: "math" | "text", index?: number) => {
    const newCellId = Date.now().toString();

    // Insert new cell ID into order array
    const newOrder = [...order];
    if (index === undefined) {
      newOrder.push(newCellId);
    } else {
      newOrder.splice(index, 0, newCellId);
    }

    // If math cell, create initial editor state
    const newStates = { ...editorStates };
    if (type === "math") {
      const root = createRootWrapper();
      const editorState = createEditorState(root);
      newStates[newCellId] = editorState;
    }

    const newTextContents = { ...textContents };
    if (type === "text") {
      newTextContents[newCellId] = "";
    }

    updateState({
      order: newOrder,
      states: newStates,
      textContents: newTextContents,
    });

    if (noteId) {
      saveNoteState(noteId, {
        order: newOrder,
        states: newStates,
        textContents: newTextContents,
      });
    }
  };

  // Delete a cell by id
  const deleteCell = (id: string) => {
    const newOrder = order.filter((cellId) => cellId !== id);
    const newStates = { ...editorStates };
    delete newStates[id];
    const newTextContents = { ...textContents };
    delete newTextContents[id];

    updateState({
      order: newOrder,
      states: newStates,
      textContents: newTextContents,
    });

    if (noteId) {
      saveNoteState(noteId, {
        order: newOrder,
        states: newStates,
        textContents: newTextContents,
      });
    }
  };

  // Update order only
  const updateOrder = (newOrder: string[]) => {
    updateState({
      order: newOrder,
      states: editorStates,
      textContents,
    });

    if (noteId) {
      saveNoteState(noteId, {
        order: newOrder,
        states: editorStates,
        textContents,
      });
    }
  };

  // Preview mode state with localStorage persistence
  const [isPreviewMode, setIsPreviewMode] = useState(() => {
    return localStorage.getItem("previewMode") === "on";
  });

  // Default zoom state with persistence
  const [defaultZoom, setDefaultZoom] = useState(() => {
    const stored = localStorage.getItem("defaultZoom");
    return stored ? parseFloat(stored) : 1;
  });

  const [resetZoomSignal, setResetZoomSignal] = useState(0);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!noteId) return;

    // Load saved editor state for new noteId, or empty fallback
    const loadedState = loadNoteState(noteId);
    if (loadedState) {
      updateState({
        order: loadedState.order,
        states: loadedState.states,
        textContents: loadedState.textContents,
      });
    } else {
      // No saved state - clear editor for this note
      updateState({
        order: [],
        states: {},
        textContents: {},
      });
    }
  }, [noteId, updateState]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  // Show/hide LaTeX map per cell
  const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});

  const showAllLatex = () => {
    setShowLatexMap((prev) =>
      Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
    );
  };

  const hideAllLatex = () => {
    setShowLatexMap((prev) =>
      Object.fromEntries(Object.keys(prev).map((key) => [key, false]))
    );
  };

  return (
    <div className={styles.editorPane} style={style}>
      <EditorHeaderBar
        isPreviewMode={isPreviewMode}
        togglePreviewMode={() => setIsPreviewMode((p) => !p)}
        defaultZoom={defaultZoom}
        resetAllZooms={resetAllZooms}
        showAllLatex={showAllLatex}
        hideAllLatex={hideAllLatex}
        handleZoomChange={handleZoomChange}
        showZoomDropdown={showZoomDropdown}
        setShowZoomDropdown={setShowZoomDropdown}
        dropdownRef={dropdownRef}
        onAddCell={addCell}
      />

      <NotationEditor
        noteId={noteId}
        isPreviewMode={isPreviewMode}
        resetZoomSignal={resetZoomSignal}
        defaultZoom={defaultZoom}
        order={order}
        addCell={addCell}
        deleteCell={deleteCell}
        updateOrder={updateOrder}
        editorStates={editorStates}
        setEditorStates={setEditorStates}
        textContents={textContents}
        setTextContents={setTextContents}
        showLatexMap={showLatexMap}
        setShowLatexMap={setShowLatexMap}
        metadata={noteMetadata}
        setMetadata={setNoteMetadata}
        onDropNode={onDropNode}
      />
    </div>
  );
};

export default EditorPane;
