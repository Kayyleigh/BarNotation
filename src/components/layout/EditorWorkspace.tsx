// components/layout/EditorWorkspace.tsx
import React, { useCallback, useEffect, useRef } from "react";
import EditorPane from "../editor/EditorPane";
import MathLibrary from "../mathLibrary/MathLibrary";
import { deleteNodeById, insertNodeAtIndex } from "../../logic/node-manipulation";
import { cloneTreeWithNewIds, isDescendantOrSelf } from "../../utils/treeUtils";
import { useEditorHistory } from "../../hooks/editorHistory/EditorHistoryContext";
import type { CellData, NoteMetadata } from "../../models/noteTypes";
import styles from "./EditorWorkspace.module.css";
import ResizableSidebar from "./ResizableSidebar";
import { useI18n } from "../../i18n/useI18n";
import type { MathNodeLibrary } from "../../models/libraryTypes";
import { createDefaultLibrary, loadLibrary } from "../../utils/mathLibraryUtils";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { CustomCommandProvider } from "../../hooks/customCommands/CustomCommandProvider";

interface EditorWorkspaceProps {
  noteId: string | null;
  noteMetadata: NoteMetadata | undefined;
  setNoteMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
  noteCells: CellData[] | undefined;
  setNoteCells: (noteId: string, newCells: CellData[]) => void;
}

const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  noteId,
  noteMetadata,
  setNoteMetadata,
  // noteCells,
  setNoteCells,
}) => {
  const { t } = useI18n(); // use language hook

  const { history, updateState } = useEditorHistory();
  const { states: editorStates, order, textContents } = history.present;

  const updateLibraryEntryRef = useRef<(id: string) => void>(() => { });

  const [library, setLibrary] = React.useState<MathNodeLibrary>(() => {
    const stored = loadLibrary(); // your util: tries localStorage first
    return stored ?? createDefaultLibrary();
  });
  
  // persist to localStorage whenever library changes
  useEffect(() => {
    try {
      localStorage.setItem("mathLibrary", JSON.stringify(library));
    } catch (err) {
      console.error("Failed to persist library", err);
    }
  }, [library]);

  // TODO: I AM NOT USING CELLS AT ALL ANYMORE I THINK. MUST FIND OUT HOW OR WHETHER TO LINK OR MERGE THAT LOGIC
  // RIGHT NOW WHEN I ADD CELLS, THEY WILL NOT UPDATE IN THE CELL COUNTS IN THE MENU BECAUSE NO CELL WAS ADDED, ONLY EDITORSTATE

  const syncNoteCellsWithOrder = useCallback(
    (order: string[], states: typeof editorStates, textContentsParam: typeof textContents) => {
      const newCells: CellData[] = order.map((id) => {
        // console.log(`const newCells in syncnotecellswithorder in editorworkspace`)

        if (states[id]) {
          return {
            id,
            type: "math",
            content: states[id],
          };
        }
        if (textContentsParam[id] !== undefined) {
          return {
            id,
            type: "text",
            content: textContentsParam[id],
          };
        }
        return {
          id,
          type: "text",
          content: { type: "plain", text: "" },
        };
      });

      if (noteId) {
        const prevState = localStorage.getItem(`note-editor-state-${noteId}`);
        if (prevState) {
          localStorage.setItem(`note-editor-state-${noteId}`, JSON.stringify({ ...JSON.parse(prevState), state: JSON.stringify(states) }));

        }
        setNoteCells(noteId, newCells);
      }
    },
    [noteId, setNoteCells]
  );

  const editorStatesRef = useRef(editorStates);
  const orderRef = useRef(order);
  const textContentsRef = useRef(textContents);
  const noteIdRef = useRef(noteId);
  const syncNoteCellsWithOrderRef = useRef(syncNoteCellsWithOrder);

  useEffect(() => {
    editorStatesRef.current = editorStates;
  }, [editorStates]);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    textContentsRef.current = textContents;
  }, [textContents]);

  useEffect(() => {
    noteIdRef.current = noteId;
  }, [noteId]);

  useEffect(() => {
    syncNoteCellsWithOrderRef.current = syncNoteCellsWithOrder;
  }, [syncNoteCellsWithOrder]);

  const onDropNode = useCallback((from: DragSource, to: DropTarget) => {
    if (!to) return;
  
    const editorStates = editorStatesRef.current;
    const noteId = noteIdRef.current;
    const order = orderRef.current;
    const textContents = textContentsRef.current;
  
    const updatedEditorStates = { ...editorStates };
  
    // Handle dropping from library
    if (from.type === "library" && to.type === "cell") {
      const destState = editorStates[to.cellId];
      if (!destState) return;
  
      // Avoid dropping into root directly
      let dropContainerId = to.containerId;
      let dropIndex = to.index + 1;

      if (dropContainerId === destState.rootNode.id) {
        const child = destState.rootNode.child;
        dropContainerId = child.id;
        dropIndex = child.children.length;
      }
  
      const cloned = cloneTreeWithNewIds(from.node);
      const updated = insertNodeAtIndex(destState, dropContainerId, dropIndex, cloned);
  
      if (updated !== destState) {
        updatedEditorStates[to.cellId] = updated;
        updateLibraryEntryRef.current?.(from.entryId);
      }
    }
  
    // Handle dragging within a cell
    else if (from.type === "cell" && to.type === "cell") {
      const sourceState = editorStates[from.cellId];
      const destState = editorStates[to.cellId];
      if (!sourceState || !destState) return;
  
      // Dropping into same cell
      if (from.cellId === to.cellId) {
        if (isDescendantOrSelf(from.node, to.containerId)) return;
  
        const node = cloneTreeWithNewIds(from.node);
        let updated = deleteNodeById(destState, from.node.id);
  
        if (from.containerId === to.containerId && to.index >= from.index) {
          updated = insertNodeAtIndex(updated, to.containerId, to.index, node);
        } else {
          updated = insertNodeAtIndex(updated, to.containerId, to.index + 1, node);
        }
  
        updatedEditorStates[to.cellId] = updated;
      }
  
      // Between cells
      else {
        const node = cloneTreeWithNewIds(from.node);
        const updatedDest = insertNodeAtIndex(destState, to.containerId, to.index + 1, node);
        updatedEditorStates[to.cellId] = updatedDest;
      }
    }
  
    // Dropping library nodes into "libraryCollection" is ignored
    else if (to.type === "libraryCollection") {
      if (from.type === "library") return; // premade or same collection no-op
      if (from.type === "cell") {
        // Optional: add to library collection if desired
      }
    }
  
    // Commit the updated editor states
    updateState({
      states: updatedEditorStates,
      order,
      textContents,
    });
  
    if (noteId) {
      syncNoteCellsWithOrderRef.current(order, updatedEditorStates, textContents);
    }
  }, [updateState]);  

  const { undo, redo } = useEditorHistory();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const editorPaneStyle = React.useMemo(() => ({ width: "100%", height: "100%" }), []);

  return (
    <CustomCommandProvider library={library}>
      <div className="editor-workspace" style={{ display: "flex", height: "100%", width: "100%" }}>
        {noteId && noteMetadata ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <EditorPane
              style={editorPaneStyle}
              noteId={noteId}
              onDropNode={onDropNode}
              noteMetadata={noteMetadata}
              setNoteMetadata={setNoteMetadata}
            />
          </div>

        ) : (
          <div className={styles.emptyMessage} style={{ flex: 1, minWidth: 0 }}>
            Select a note or create a new one.
          </div>
        )}
        <ResizableSidebar
          side="right"
          title={t("layout.mathLibraryPanel")}
        // storageKey="math-library"
        >
          <MathLibrary
            library={library}
            setLibrary={setLibrary}
            updateEntryRef={updateLibraryEntryRef}
          />
        </ResizableSidebar>
      </div>
    </CustomCommandProvider>
  );
};

export default React.memo(EditorWorkspace);
