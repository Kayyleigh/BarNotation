// components/editor/EditorPane.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import EditorHeaderBar from "./EditorHeaderBar";
import NotationEditor from "./NotationEditor";
import styles from "./Editor.module.css";
import type { NoteMetadata, TextCellContent } from "../../models/noteTypes";
import type { MathNode } from "../../models/types";
import { useEditorHistory } from "../../hooks/EditorHistoryContext";
import { createRootWrapper } from "../../models/nodeFactories";
import { createEditorState, type EditorState } from "../../logic/editor-state";
import { EditorModeProvider } from "../../hooks/EditorModeProvider";

type DropSource = {
  sourceType: "cell" | "library";
  cellId?: string;
  containerId: string;
  index: number;
  node: MathNode;
};

type DropTarget = {
  cellId: string;
  containerId: string;
  index: number;
};

interface EditorPaneProps {
  noteId: string | null;
  noteMetadata: NoteMetadata;
  setNoteMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
  style?: React.CSSProperties;
  onDropNode: (from: DropSource, to: DropTarget) => void;
}

// LocalStorage helpers
function loadNoteState(noteId: string) {
  try {
    const saved = localStorage.getItem(`note-editor-state-${noteId}`);
    if (!saved) return null;
    return JSON.parse(saved) as {
      order: string[];
      states: Record<string, EditorState>;
      textContents: Record<string, TextCellContent>;
    };
  } catch {
    return null;
  }
}

function saveNoteState(noteId: string, state: {
  order: string[];
  states: Record<string, EditorState>;
  textContents: Record<string, TextCellContent>;
}) {
  try {
    localStorage.setItem(`note-editor-state-${noteId}`, JSON.stringify(state));
  } catch {
    // Ignore write errors
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

  // Persistent Zoom + Preview Mode
  const [defaultZoom, setDefaultZoom] = useState(() =>
    parseFloat(localStorage.getItem("defaultZoom") ?? "1")
  );
  const [resetZoomSignal, setResetZoomSignal] = useState(0);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  // const [isPreviewMode, setIsPreviewMode] = useState(() =>
  //   localStorage.getItem("previewMode") === "on"
  // );
  const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Persist current editor state
  const persistState = useCallback(
    (next: {
      order: string[];
      states: typeof editorStates;
      textContents: typeof textContents;
    }) => {
      updateState(next);
      if (noteId) saveNoteState(noteId, next);
    },
    [noteId, updateState]
  );

  const setEditorStates = useCallback(
    (value: React.SetStateAction<typeof editorStates>) => {
      const newStates =
        typeof value === "function" ? value(editorStates) : value;
      persistState({ order, states: newStates, textContents });
    },
    [order, editorStates, textContents, persistState]
  );

  const setTextContents = useCallback(
    (value: React.SetStateAction<typeof textContents>) => {
      const newContents =
        typeof value === "function" ? value(textContents) : value;
      persistState({ order, states: editorStates, textContents: newContents });
    },
    [order, editorStates, textContents, persistState]
  );

  const addCell = useCallback(
    (type: "math" | "text", index?: number) => {
      const newId = Date.now().toString();
      const newOrder = [...order];

      if (index != null) {
        newOrder.splice(index, 0, newId);
      } else {
        newOrder.push(newId);
      }

      const newStates = { ...editorStates };
      const newTextContents = { ...textContents };

      if (type === "math") {
        newStates[newId] = createEditorState(createRootWrapper());
      } else {
        newTextContents[newId] = { type: "plain", text: "" };
      }

      persistState({ order: newOrder, states: newStates, textContents: newTextContents });
    },
    [order, editorStates, textContents, persistState]
  );

  const addCellRef = useRef(addCell);
  useEffect(() => {
    addCellRef.current = addCell;
  }, [addCell]);

  const deleteCell = useCallback(
    (id: string) => {
      const newOrder = order.filter((cellId) => cellId !== id);
      const newStates = { ...editorStates };
      const newTextContents = { ...textContents };
      delete newStates[id];
      delete newTextContents[id];
      persistState({ order: newOrder, states: newStates, textContents: newTextContents });
    },
    [order, editorStates, textContents, persistState]
  );

  const duplicateCell = useCallback(
    (id: string) => {
      const newId = Date.now().toString();
      const index = order.indexOf(id);
      const newOrder = [...order];

      if (index != -1) {
        newOrder.splice(index + 1, 0, newId);
      } else {
        newOrder.push(newId);
      }

      const newStates = { ...editorStates };
      const newTextContents = { ...textContents };

      if (editorStates[id]) {
        newStates[newId] = structuredClone(editorStates[id]);
      }
      if (textContents[id] != null) {
        newTextContents[newId] = textContents[id];
      }

      persistState({ order: newOrder, states: newStates, textContents: newTextContents });
    },
    [order, editorStates, textContents, persistState]
  );

  const updateOrder = useCallback(
    (newOrder: string[]) => {
      persistState({ order: newOrder, states: editorStates, textContents });
    },
    [editorStates, textContents, persistState]
  );

  // Zoom + Preview Handlers
  const resetAllZooms = useCallback(() => {
    setResetZoomSignal((n) => n + 1);
    localStorage.setItem("defaultZoom", String(defaultZoom));
  }, [defaultZoom]);

  const handleZoomChange = useCallback((value: number) => {
    const clamped = Math.max(0.5, Math.min(2, value));
    setDefaultZoom(clamped);
    localStorage.setItem("defaultZoom", clamped.toString());
    resetAllZooms();
  }, [resetAllZooms]);

  // const togglePreviewMode = useCallback(() => {
  //   setIsPreviewMode((prev) => {
  //     localStorage.setItem("previewMode", prev ? "off" : "on");
  //     return !prev;
  //   });
  // }, []);

  const showAllLatex = useCallback(() => {
    setShowLatexMap((prev) =>
      Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
    );
  }, []);

  const hideAllLatex = useCallback(() => {
    setShowLatexMap((prev) =>
      Object.fromEntries(Object.keys(prev).map((key) => [key, false]))
    );
  }, []);

  // 📥 Effects
  useEffect(() => {
    if (!noteId) return;
    const loaded = loadNoteState(noteId);
    persistState(
      loaded ?? { order: [], states: {}, textContents: {} }
    );
  }, [noteId, persistState]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowZoomDropdown(false);
      }
    };
    if (showZoomDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showZoomDropdown]);

  return (
    <EditorModeProvider>
      <div className={styles.editorPane} style={style}>
        <EditorHeaderBar
          defaultZoom={defaultZoom}
          resetAllZooms={resetAllZooms}
          handleZoomChange={handleZoomChange}
          showAllLatex={showAllLatex}
          hideAllLatex={hideAllLatex}
          showZoomDropdown={showZoomDropdown}
          setShowZoomDropdown={setShowZoomDropdown}
          dropdownRef={dropdownRef}
          onAddCell={addCell} //ref instead?? Actually this one only needs the ability to add at the end!!
        />
        <NotationEditor
          noteId={noteId}
          // isPreviewMode={isPreviewMode}
          resetZoomSignal={resetZoomSignal}
          defaultZoom={defaultZoom}
          order={order}
          addCell={addCell}//ref instead??
          deleteCell={deleteCell}
          duplicateCell={duplicateCell}
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
    </EditorModeProvider>
  );
};

export default EditorPane;
