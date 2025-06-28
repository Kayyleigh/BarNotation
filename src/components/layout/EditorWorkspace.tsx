// import React, { useCallback } from "react";
// import EditorPane from "../editor/EditorPane";
// import MathLibrary from "../mathLibrary/MathLibrary";
// import type { MathNode } from "../../models/types";

// interface EditorWorkspaceProps {
//   noteId: string | null;
//   rightWidth: number;
//   setRightWidth: (width: number) => void;
// }

// // The type definition of a drop event
// type DropSource = {
//   sourceType: "cell" | "library";
//   cellId?: string;
//   containerId: string;
//   index: number;
//   node: MathNode;
// };

// type DropTarget = {
//   cellId: string;
//   containerId: string;
//   index: number;
// };


// const onDropNode = useCallback(
//   (from: DropSource, to: DropTarget) => {
//     console.log("🔥 DROP EVENT");
//     console.log("From:", from);
//     console.log("To:", to);

//     // Placeholder for editor state management
//     // e.g. get editorStateMap[from.cellId] etc.
//     const sourceState = /* get editor state for from.cellId */;
//     const destState = /* get editor state for to.cellId */;
//     const updateEditorState = (cellId: string, newState: EditorState) => {
//       /* e.g. dispatch(updateEditorState(cellId, newState)) */
//     };

//     if (from.sourceType === "cell" && !sourceState) return;
//     if (!destState) return;

//     // ─── CASE 1: Move within same cell ─────────────────────
//     if (
//       from.sourceType === "cell" &&
//       from.cellId === to.cellId &&
//       from.containerId === to.containerId
//     ) {
//       console.log("➡️ Move within same cell/container");
//       const node = from.node;
//       let updated = deleteNodeById(destState, node.id);
//       updated = insertNodeAtIndex(updated, to.containerId, to.index, node);
//       updateEditorState(to.cellId, updated);
//     }

//     // ─── CASE 2: Move between cells ────────────────────────
//     else if (
//       from.sourceType === "cell" &&
//       from.cellId !== to.cellId
//     ) {
//       console.log("📤 Copy node to another cell");

//       const node = from.node;
//       const updatedSource = deleteNodeById(sourceState, node.id);
//       const updatedDest = insertNodeAtIndex(destState, to.containerId, to.index, node);

//       updateEditorState(from.cellId!, updatedSource);
//       updateEditorState(to.cellId, updatedDest);
//     }

//     // ─── CASE 3: Insert clone from library ─────────────────
//     else if (from.sourceType === "library") {
//       console.log("➕ Clone library item into cell");
//       const cloned = { ...from.node, id: crypto.randomUUID() };
//       const updated = insertNodeAtIndex(destState, to.containerId, to.index, cloned);
//       updateEditorState(to.cellId, updated);
//     }

//     // ─── CASE 4: Drop to library ───────────────────────────
//     else if (to.containerId === "math-library") {
//       console.log("📚 Clone node into library");
//       // dispatch(addToLibrary(from.node))
//     }

//     else {
//       console.warn("Unhandled drop case.");
//     }
//   },
//   []
// );

// const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
//   noteId,
//   rightWidth,
//   setRightWidth,
// }) => {
//   // TODO: Hook into your global state (e.g. context or Redux or note data)
//   // For now, let's just console.log the drop result

//   const onDropNode = useCallback(
//     (from: DropSource, to: DropTarget) => {
//       console.log("🔥 DROP EVENT");
//       console.log("From:", from);
//       console.log("To:", to);

//       // ─── CASE 1: Move within same cell ─────────────────────
//       if (
//         from.sourceType === "cell" &&
//         from.cellId === to.cellId &&
//         from.containerId === to.containerId
//       ) {
//         console.log("➡️ Move within same cell/container");
//         // Update that cell's node order (e.g. reorder in-place)
//         // dispatch(reorderNodes(...))
//       }

//       // ─── CASE 2: Move between cells ────────────────────────
//       else if (
//         from.sourceType === "cell" &&
//         (from.cellId !== to.cellId)
//       ) {
//         console.log("📤 Copy node to another cell");
//         // Remove from source, insert into destination
//         // dispatch(moveNodeBetweenCells(...))
//       }

//       // ─── CASE 3: Insert clone from library ─────────────────
//       else if (from.sourceType === "library") {
//         console.log("➕ Clone library item into cell");
//         const cloned = { ...from.node, id: crypto.randomUUID() };
//         console.log("cloned (case 3)", cloned)
//         // dispatch(insertNode({ cellId: to.cellId, containerId: to.containerId, index: to.index, node: cloned }))
//       }

//       // ─── CASE 4: Drop to library ───────────────────────────
//       else if (to.containerId === "math-library") {
//         console.log("📚 Clone node into library");
//         // dispatch(addToLibrary(from.node))
//       }

//       // You can add state updating logic or dispatches based on your architecture here.
//     },
//     []
//   );

//   return (
//     <div className="editor-workspace" style={{ display: "flex", flexGrow: 1 }}>
//       <EditorPane
//         style={{ flexGrow: 1 }}
//         noteId={noteId}
//         onDropNode={onDropNode} // ✅ passed to child
//       />

//       <MathLibrary
//         width={rightWidth}
//         onWidthChange={setRightWidth}
//         onDropNode={onDropNode} // ✅ optionally if you support dropping to library
//       />
//     </div>
//   );
// };

// export default EditorWorkspace;


// const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
//   noteId,
//   rightWidth,
//   setRightWidth,
// }) => {
//   const onDropNode = useCallback(
//     (
//       from: DropSource,
//       to: DropTarget,
//       editorStates: Record<string, EditorState>,
//       setEditorStates: React.Dispatch<React.SetStateAction<Record<string, EditorState>>>
//     ) => {
//       const sourceState = from.cellId ? editorStates[from.cellId] : null;
//       const destState = editorStates[to.cellId];
//       if (!destState) return;

//       // ─── CASE 1: Move within same cell ─────────────────────
//       if (
//         from.sourceType === "cell" &&
//         from.cellId === to.cellId
//       ) {
//         // target inside source is not allowed
//         if (isDescendantOrSelf(from.node, to.containerId)) {
//           return;
//         } 
//         //const node = from.node;  //TODO: may use this again if I can be sure that deleteNodeById is never failing
//         const node = cloneTreeWithNewIds(from.node); // Recursive deep-copy (new unique IDs) - safe in case deletion fails
//         let updated = deleteNodeById(destState, from.node.id);
//         updated = insertNodeAtIndex(updated, to.containerId, to.index, node);

//         setEditorStates((prev) => ({ ...prev, [to.cellId]: updated }));
//       }

//       // ─── CASE 2: Copy to another cell (deep clone) ───────────────
//       else if (from.sourceType === "cell" && from.cellId !== to.cellId && sourceState) {
//         const node = cloneTreeWithNewIds(from.node); // Recursive deep-copy (new unique IDs)

//         node.id = crypto.randomUUID(); // Assign new unique ID

//         const updatedDest = insertNodeAtIndex(destState, to.containerId, to.index + 1, node);
//         // console.log(`Insert ${nodeToLatex(node)} into ${to.containerId}, ${to.index + 1} of state ${destState}`)
//         // const container = findNodeById(destState.rootNode, to.containerId);
//         // console.log(`${container?.type}`)
//         setEditorStates((prev) => ({
//           ...prev,
//           [to.cellId]: updatedDest,
//         }));
//       }

//       // ─── CASE 3: Clone from library ────────────────────────
//       else if (from.sourceType === "library") {
//         const cloned = cloneTreeWithNewIds(from.node);
//         const updated = insertNodeAtIndex(destState, to.containerId, to.index, cloned);
//         setEditorStates((prev) => ({ ...prev, [to.cellId]: updated }));
//       }

//       // ─── CASE 4: Drop to library ───────────────────────────
//       else if (to.containerId === "math-library") {
//         console.log("📚 Clone node into library");
//         // TODO: implement this if needed
//       }

//       else {
//         const container = findNodeById(destState.rootNode, to.containerId);
//         console.warn(`Unhandled drop case: ${from.sourceType} ${from.cellId} to ${to.cellId} ${to.containerId} (${container?.type}) ${to.index}`);
//       }
//     },
//     []
//   );

//   return (
//     <div className="editor-workspace" style={{ display: "flex", flexGrow: 1 }}>
//       <EditorPane
//         style={{ flexGrow: 1 }}
//         noteId={noteId}
//         onDropNode={(from, to, editorStates, setEditorStates) =>
//           onDropNode(from, to, editorStates, setEditorStates)
//         }
//       />
//       <MathLibrary
//         width={rightWidth}
//         onWidthChange={setRightWidth}
//         onDropNode={() => {}} // Optional: handle drops to library if needed
//       />
//     </div>
//   );
// };

// export default EditorWorkspace;

// components/layout/EditorWorkspace.tsx
import React, { useCallback, useEffect, useRef } from "react";
import EditorPane from "../editor/EditorPane";
import MathLibrary from "../mathLibrary/MathLibrary";
import type { MathNode } from "../../models/types";
import { deleteNodeById, insertNodeAtIndex } from "../../logic/node-manipulation";
import { cloneTreeWithNewIds, isDescendantOrSelf } from "../../utils/treeUtils";
import { useEditorHistory } from "../../hooks/EditorHistoryContext";
import type { LibraryEntry } from "../../models/libraryTypes";

interface EditorWorkspaceProps {
  noteId: string | null;
  rightWidth: number;
  setRightWidth: (width: number) => void;
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

const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({ noteId, rightWidth, setRightWidth }) => {
  const { history, updateState } = useEditorHistory();
  // const editorStates = history.present;
  const { states: editorStates, order } = history.present;

  const onDropNode = useCallback(
    (from: DropSource, to: DropTarget) => {
      const sourceState = from.cellId ? editorStates[from.cellId] : null;

      // Handle library case first, since it will NOT find an editorState for the so-called "library cell"
      if (to.cellId === "library" && from.sourceType !== "library") {
        // Special case: dropping to the library
        const cloned = cloneTreeWithNewIds(from.node);
        const newEntry = {
          id: crypto.randomUUID(),
          node: cloned,
        };
      
        addEntryToLibraryRef.current?.(newEntry);
        return;
      }

      const destState = editorStates[to.cellId];

      if (!destState) return;

      const updatedEditorStates = { ...editorStates };

      if (from.sourceType === "cell" && from.cellId === to.cellId) {
        if (isDescendantOrSelf(from.node, to.containerId)) return;
        const node = cloneTreeWithNewIds(from.node);
        let updated = deleteNodeById(destState, from.node.id);

        //index + 1 if to the left within same container(?), else index 
        if (from.containerId === to.containerId && to.index >= from.index) {
          updated = insertNodeAtIndex(updated, to.containerId, to.index, node);
        } 
        else {
          updated = insertNodeAtIndex(updated, to.containerId, to.index + 1, node);

        }
        updatedEditorStates[to.cellId] = updated;
      }

      else if (from.sourceType === "cell" && from.cellId !== to.cellId && sourceState) {
        const node = cloneTreeWithNewIds(from.node);
        node.id = crypto.randomUUID();
        const updatedDest = insertNodeAtIndex(destState, to.containerId, to.index + 1, node);
        updatedEditorStates[to.cellId] = updatedDest;
      }

      else if (from.sourceType === "library") {
        const cloned = cloneTreeWithNewIds(from.node);
        const updated = insertNodeAtIndex(destState, to.containerId, to.index + 1, cloned);
        updatedEditorStates[to.cellId] = updated;
      }

      else {
        console.log(`You done fucked up`)
      }

      updateState({
        states: updatedEditorStates,
        order, // reuse the current order for now
      });
    },
    [editorStates, order, updateState]
  );

  const { undo, redo } = useEditorHistory();

  const addEntryToLibraryRef = useRef<(entry: LibraryEntry) => void>(() => {});

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
    <div 
      className="editor-workspace" 
      style={{ 
        display: "flex", 
        height: "100%",
        width: "100%",
      }}
    >
      {/* Center editor: flexible */}
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <EditorPane
          style={{ width: "100%", height: "100%" }}
          noteId={noteId}
          onDropNode={(from, to) => onDropNode(from, to)}
        />
      </div>

      {/* Right sidebar: fixed width */}
      <div style={{ flex: "0 0 auto", width: `${rightWidth}px` }}>
        <MathLibrary
          width={rightWidth}
          onWidthChange={setRightWidth}
          onDropNode={(from, to) => onDropNode(from, to)}
          addEntryRef={addEntryToLibraryRef}
        />
      </div>
    </div>
  );
};

export default EditorWorkspace;
