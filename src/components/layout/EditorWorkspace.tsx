import React, { useCallback, useEffect, useRef } from "react";
import EditorPane from "../editor/EditorPane";
import MathLibrary from "../mathLibrary/MathLibrary";
import type { MathNode } from "../../models/types";
import { deleteNodeById, insertNodeAtIndex } from "../../logic/node-manipulation";
import { cloneTreeWithNewIds, isDescendantOrSelf } from "../../utils/treeUtils";
import { useEditorHistory } from "../../hooks/EditorHistoryContext";
import type { LibraryEntry } from "../../models/libraryTypes";
import { nodeToLatex } from "../../models/nodeToLatex"; 
import type { CellData, NoteMetadata } from "../../models/noteTypes";
import styles from "./EditorWorkspace.module.css";

interface EditorWorkspaceProps {
  noteId: string | null;
  rightWidth: number;
  setRightWidth: (width: number) => void;
  noteMetadata: NoteMetadata | undefined;
  setNoteMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
  noteCells: CellData[] | undefined;
  setNoteCells: (noteId: string, newCells: CellData[]) => void;
}

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

  const addEntryToLibraryRef = useRef<(entry: LibraryEntry) => void>(() => {});
  const updateLibraryEntryRef = useRef<(id: string) => void>(() => {});

  const syncNoteCellsWithOrder = useCallback(
    (order: string[], states: typeof editorStates, textContentsParam: typeof textContents) => {
      const newCells: CellData[] = order.map((id) => {
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
          content: "",
        };
      });
  
      if (noteId) {
        //TODO also update editor state in local storage
//        order, states: editorStates, textContents: newContents
        const prevState = localStorage.getItem(`note-editor-state-${noteId}`);
        if (prevState) {
          localStorage.setItem(`note-editor-state-${noteId}`, JSON.stringify({ ...JSON.parse(prevState), state: JSON.stringify(states) }));

        }
        // console.log(`Want to set ${nodeToLatex(states[noteId].rootNode)} --- ${states[noteId]}`)
        // console.log(`Want to set  --- ${states[noteId]}`)
        // console.log(`Want to set  --- ${JSON.stringify(states)}`)
        setNoteCells(noteId, newCells);
      }
    },
    [noteId, setNoteCells]
  );

  const onDropNode = useCallback(
    (from: DropSource, to: DropTarget) => {
      const sourceState = from.cellId ? editorStates[from.cellId] : null;

      // Drop from editor to library
      if (to.cellId === "library" && from.sourceType === "cell") {
        console.log(`Cloning ${nodeToLatex(from.node)} to ${to.containerId}`)
        const cloned = cloneTreeWithNewIds(from.node);
        const newEntry: LibraryEntry = {
          id: crypto.randomUUID(),
          node: cloned,
          addedAt: Date.now(),
          draggedCount: 0,
          latex: nodeToLatex(cloned),
        };
        addEntryToLibraryRef.current?.(newEntry);
        return;
      }

      const destState = editorStates[to.cellId];
      if (!destState) return;

      // Redirect drop if container is the root-wrapper node
      if (to.containerId === "root") {
        const inlineContainerChild = destState.rootNode.child;
        if (inlineContainerChild) {
          to = {
            ...to,
            containerId: inlineContainerChild.id,
            index: inlineContainerChild.children?.length ?? 0, // drop at the end
          };
        }
      }

      const updatedEditorStates = { ...editorStates };

      // Drag within same cell
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
      // Drag from one cell to another
      else if (from.sourceType === "cell" && from.cellId !== to.cellId && sourceState) {
        const node = cloneTreeWithNewIds(from.node);
        const updatedDest = insertNodeAtIndex(destState, to.containerId, to.index + 1, node);
        updatedEditorStates[to.cellId] = updatedDest;
      }
      // From library to editor
      else if (from.sourceType === "library") {
        const cloned = cloneTreeWithNewIds(from.node);
        const updated = insertNodeAtIndex(destState, to.containerId, to.index + 1, cloned);
        const dropFailed = updated === destState;

        if (dropFailed) return; // no update if drop failed

        updatedEditorStates[to.cellId] = updated;

        // Increment drag count in the library
        updateLibraryEntryRef.current?.(from.containerId);
      }

      updateState({
        states: updatedEditorStates,
        order,
        textContents,
      });

      // Persist in noteCells
      if (noteId) {
        syncNoteCellsWithOrder(order, updatedEditorStates, textContents);
      }
    },
    [editorStates, noteId, order, syncNoteCellsWithOrder, textContents, updateState]
  );

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

  return (
    <div className="editor-workspace" style={{ display: "flex", height: "100%", width: "100%" }}>
      {noteId && noteMetadata ? (
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <EditorPane
            style={{ width: "100%", height: "100%" }}
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
          addEntryRef={addEntryToLibraryRef}
          updateEntryRef={updateLibraryEntryRef}
        />
      </div>
    </div>
  );
};

export default EditorWorkspace;
