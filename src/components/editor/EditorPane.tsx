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
import { useEditorHistory } from "../../hooks/editorHistory/EditorHistoryContext";
import { createRootWrapper } from "../../models/nodeFactories";
import { createEditorState, type EditorState } from "../../logic/editor-state";
import { EditorModeProvider } from "../../hooks/editorMode/EditorModeProvider";
import type { DragSource } from "../../hooks/mathDrag/DragContext";
import { MAX_ZOOM, MIN_ZOOM } from "../../constants/editorConstants";
import { LatexRefreshProvider } from "../../hooks/latexViewRefresh/LatexRefreshProvider";

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
  onDropNode: (from: DragSource, to: DropTarget) => void;
}

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

function shallowEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
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

  const [defaultZoom, setDefaultZoom] = useState(() =>
    parseFloat(localStorage.getItem("defaultZoom") ?? "1")
  );
  const [resetZoomSignal, setResetZoomSignal] = useState(0);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const persistState = useCallback(
    (
      next: { order: string[]; states: Record<string, EditorState>; textContents: Record<string, TextCellContent> },
      prev: { states: Record<string, EditorState>; textContents: Record<string, TextCellContent> },
      skipUpdatedAt = false
    ) => {
      updateState(next);

      if (!noteId) return;

      saveNoteState(noteId, next);

      if (!prev || skipUpdatedAt) return;

      const editorStatesChanged = Object.keys(next.states).some((key) => {
        const prevRoot = prev.states[key]?.rootNode;
        const nextRoot = next.states[key]?.rootNode;
        return !shallowEqual(prevRoot, nextRoot);
      });

      const textContentsChanged = Object.keys(next.textContents).some((key) => {
        const prevText = prev.textContents[key];
        const nextText = next.textContents[key];
        return !shallowEqual(prevText, nextText);
      });

      if (editorStatesChanged || textContentsChanged) {
        setNoteMetadata(noteId, { updatedAt: Date.now() });
      }
    },
    [noteId, setNoteMetadata, updateState]
  );

  const setEditorStates = useCallback(
    (value: React.SetStateAction<typeof editorStates>) => {
      const newStates =
        typeof value === "function" ? value(editorStates) : value;
      persistState(
        { order, states: newStates, textContents },
        { states: editorStates, textContents }
      );
    },
    [order, editorStates, textContents, persistState]
  );

  const setTextContents = useCallback(
    (value: React.SetStateAction<typeof textContents>) => {
      const newContents =
        typeof value === "function" ? value(textContents) : value;
      persistState(
        { order, states: editorStates, textContents: newContents },
        { states: editorStates, textContents }
      );
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

      persistState(
        { order: newOrder, states: newStates, textContents: newTextContents },
        { states: editorStates, textContents }
      );
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
      persistState(
        { order: newOrder, states: newStates, textContents: newTextContents },
        { states: editorStates, textContents }
      );
    },
    [order, editorStates, textContents, persistState]
  );

  const duplicateCell = useCallback(
    (id: string) => {
      const newId = Date.now().toString();
      const index = order.indexOf(id);
      const newOrder = [...order];
      if (index !== -1) {
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

      persistState(
        { order: newOrder, states: newStates, textContents: newTextContents },
        { states: editorStates, textContents }
      );
    },
    [order, editorStates, textContents, persistState]
  );

  const updateOrder = useCallback(
    (newOrder: string[]) => {
      persistState(
        { order: newOrder, states: editorStates, textContents },
        { states: editorStates, textContents }
      );
    },
    [editorStates, textContents, persistState]
  );

  const resetAllZooms = useCallback(() => {
    setResetZoomSignal((n) => n + 1);
    localStorage.setItem("defaultZoom", String(defaultZoom));
  }, [defaultZoom]);

  const handleZoomChange = useCallback((value: number) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
    setDefaultZoom(clamped);
    localStorage.setItem("defaultZoom", clamped.toString());
    resetAllZooms();
  }, [resetAllZooms]);

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

  useEffect(() => {
    if (!noteId) return;
    const loaded = loadNoteState(noteId);
    const state = loaded ?? { order: [], states: {}, textContents: {} };

    const initialLatexMap: Record<string, boolean> = {};
    for (const id of state.order) {
      if (state.states[id]) {
        initialLatexMap[id] = false;
      }
    }
    setShowLatexMap(initialLatexMap);

    // skip updating updatedAt on load
    persistState(state, { states: {}, textContents: {} }, true); 
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
        <LatexRefreshProvider>
          <EditorHeaderBar
            defaultZoom={defaultZoom}
            resetAllZooms={resetAllZooms}
            handleZoomChange={handleZoomChange}
            showAllLatex={showAllLatex}
            hideAllLatex={hideAllLatex}
            showZoomDropdown={showZoomDropdown}
            setShowZoomDropdown={setShowZoomDropdown}
            dropdownRef={dropdownRef}
            onAddCell={addCellRef.current}
          />
          <NotationEditor
            noteId={noteId}
            resetZoomSignal={resetZoomSignal}
            defaultZoom={defaultZoom}
            order={order}
            addCellRef={addCellRef}
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
        </LatexRefreshProvider>
      </div>
    </EditorModeProvider>
  );
};

export default EditorPane;
