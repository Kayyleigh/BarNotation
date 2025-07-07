import React, { useCallback, useEffect, useRef } from "react";
import EditorPane from "../editor/EditorPane";
import MathLibrary from "../mathLibrary/MathLibrary";
import { deleteNodeById, insertNodeAtIndex } from "../../logic/node-manipulation";
import { cloneTreeWithNewIds, isDescendantOrSelf } from "../../utils/treeUtils";
import { useEditorHistory } from "../../hooks/EditorHistoryContext";
import { nodeToLatex } from "../../models/nodeToLatex"; 
import type { CellData, NoteMetadata } from "../../models/noteTypes";
import styles from "./EditorWorkspace.module.css";
import type { MathNode } from "../../models/types";

interface EditorWorkspaceProps {
  noteId: string | null;
  rightWidth: number;
  setRightWidth: (width: number) => void;
  noteMetadata: NoteMetadata | undefined;
  setNoteMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
  noteCells: CellData[] | undefined;
  setNoteCells: (noteId: string, newCells: CellData[]) => void;
}

export type DropSource = {
  sourceType: "cell" | "library";
  cellId?: string;
  containerId: string;
  index: number;
  node: MathNode;
};

export type DropTarget = {
  cellId: string;
  containerId: string;
  index: number;
};

const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  noteId,
  rightWidth,
  setRightWidth,
  noteMetadata,
  setNoteMetadata,
  // noteCells,
  setNoteCells,
}) => {
  const { history, updateState } = useEditorHistory();
  const { states: editorStates, order, textContents } = history.present;

  const updateLibraryEntryRef = useRef<(id: string) => void>(() => {});

  // TODO: I AM NOT USING CELLS AT ALL ANYMORE I THINK. MUST FIND OUT HOW OR WHETHER TO LINK OR MERGE THAT LOGIC
  // RIGHT NOW WHEN I ADD CELLS, THEY WILL NOT UPDATE IN THE CELL COUNTS IN THE MENU BECAUSE NO CELL WAS ADDED, ONLY EDITORSTATE

  const syncNoteCellsWithOrder = useCallback(
    (order: string[], states: typeof editorStates, textContentsParam: typeof textContents) => {
      const newCells: CellData[] = order.map((id) => {
        console.log(`const newCells in syncnotecellswithorder in editorworkspace`)

        if (states[id]) {
          return {
            id,
            type: "math",
            content: nodeToLatex(states[id].rootNode),
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
          content: {type: "plain", text: ""},
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

  const onDropNode = useCallback((from: DropSource, to: DropTarget) => {
    const editorStates = editorStatesRef.current;
    const noteId = noteIdRef.current;
    const order = orderRef.current;
    const textContents = textContentsRef.current;
  
    const sourceState = from.cellId ? editorStates[from.cellId] : null;
  
    if (to.cellId === "library" && from.sourceType === "cell") {
      console.log(`Cloning ${nodeToLatex(from.node)} to ${to.containerId}`);
      return;
    }
  
    const destState = editorStates[to.cellId];
    if (!destState) return;
  
    if (to.containerId === "root") {
      const inlineContainerChild = destState.rootNode.child;
      if (inlineContainerChild) {
        to = {
          ...to,
          containerId: inlineContainerChild.id,
          index: inlineContainerChild.children?.length ?? 0,
        };
      }
    }
  
    const updatedEditorStates = { ...editorStates };
  
    if (from.sourceType === "cell" && from.cellId === to.cellId) {
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
    else if (from.sourceType === "cell" && from.cellId !== to.cellId && sourceState) {
      const node = cloneTreeWithNewIds(from.node);
      const updatedDest = insertNodeAtIndex(destState, to.containerId, to.index + 1, node);
      updatedEditorStates[to.cellId] = updatedDest;
    }
    else if (from.sourceType === "library") {
      console.log(`Cloning from library ${nodeToLatex(from.node)} to ${to.cellId} ${to.containerId} ${to.index}`);
  
      const cloned = cloneTreeWithNewIds(from.node);
      const updated = insertNodeAtIndex(destState, to.containerId, to.index + 1, cloned);
      if (updated === destState) return;
  
      updatedEditorStates[to.cellId] = updated;
  
      updateLibraryEntryRef.current?.(from.containerId);
    }
  
    updateState({
      states: updatedEditorStates,
      order,
      textContents,
    });
  
    if (noteId) {
      syncNoteCellsWithOrderRef.current(order, updatedEditorStates, textContents);
    }
  }, [updateState]); // no dependencies because we use refs
  

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
    <div className="editor-workspace" style={{ display: "flex", height: "100%", width: "100%" }}>
      {noteId && noteMetadata ? (
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <EditorPane
            style={editorPaneStyle}
            noteId={noteId}
            onDropNode={onDropNode}
            noteMetadata={noteMetadata}
            setNoteMetadata={setNoteMetadata}
          />
        </div>
        
        ) : (
          <div className={styles.emptyMessage} style={{ flexGrow: 1, minWidth: 0 }}>
            Select a note or create a new one.
          </div>
        )}
      <div style={{ flex: "0 0 auto", width: `${rightWidth}px` }}>
        <MathLibrary
          width={rightWidth}
          onWidthChange={setRightWidth}
          onDropNode={onDropNode}
          updateEntryRef={updateLibraryEntryRef}
        />
      </div>
    </div>
  );
};

export default React.memo(EditorWorkspace);
