// // import React, { useState, useRef, useEffect } from "react";
// // import EditorHeaderBar from "./EditorHeaderBar";
// // import NotationEditor from "./NotationEditor";
// // import styles from "./Editor.module.css";
// // import type { CellData, NoteMetadata } from "../../models/noteTypes";
// // import { createEditorState, type EditorState } from "../../logic/editor-state";
// // import { createRootWrapper } from "../../models/nodeFactories";

// // const EditorPane: React.FC<{ noteId: string | null; style?: React.CSSProperties }> = ({
// //   noteId,
// //   style,
// // }) => {
// //   // ---- UI state (zoom, preview, dropdowns) ----
// //   const [isPreviewMode, setIsPreviewMode] = useState(() => {
// //     return localStorage.getItem("previewMode") === "on";
// //   });

// //   const [defaultZoom, setDefaultZoom] = useState(() => {
// //     const stored = localStorage.getItem("defaultZoom");
// //     return stored ? parseFloat(stored) : 1;
// //   });

// //   const [resetZoomSignal, setResetZoomSignal] = useState(0);
// //   const [showZoomDropdown, setShowZoomDropdown] = useState(false);
// //   const dropdownRef = useRef<HTMLDivElement | null>(null);

// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// //         setShowZoomDropdown(false);
// //       }
// //     };

// //     if (showZoomDropdown) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     }

// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, [showZoomDropdown]);

// //   const resetAllZooms = () => {
// //     setResetZoomSignal((n) => n + 1);
// //     localStorage.setItem("defaultZoom", String(defaultZoom));
// //   };

// //   const handleZoomChange = (value: number) => {
// //     const clamped = Math.max(0.5, Math.min(2, value));
// //     setDefaultZoom(clamped);
// //     localStorage.setItem("defaultZoom", clamped.toString());
// //     resetAllZooms();
// //   };

// //   // ---- Cell logic ----
// //   const [cells, setCells] = useState<CellData[]>([]);

// //   //NEW
// //   const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({});

// //   // useEffect(() => {
// //   //   // Initialize new math cells
// //   //   setEditorStates((prev) => {
// //   //     const next = { ...prev };
// //   //     cells.forEach((cell) => {
// //   //       if (cell.type === "math" && !next[cell.id]) {
// //   //         const root = createRootWrapper();
// //   //         console.log("Creating editor state for math cell", cell.id, root);
// //   //         next[cell.id] = createEditorState(root);
// //   //       }
// //   //     });
// //   //     return next;
// //   //   });
// //   // }, [cells]);
  
// //   // useEffect(() => {
// //   //   // Cleanup removed math cells
// //   //   setEditorStates((prev) => {
// //   //     const next: typeof prev = {};
// //   //     cells.forEach((cell) => {
// //   //       if (cell.type === "math" && prev[cell.id]) {
// //   //         next[cell.id] = prev[cell.id];
// //   //       }
// //   //     });
// //   //     return next;
// //   //   });
// //   // }, [cells]);
// //   useEffect(() => {
// //     setEditorStates((prev) => {
// //       const next: Record<string, EditorState> = {};
// //       cells.forEach((cell) => {
// //         if (cell.type === "math") {
// //           // reuse previous if exists, else create new
// //           next[cell.id] = prev[cell.id] ?? createEditorState(createRootWrapper());
// //         }
// //       });
// //       return next;
// //     });
// //   }, [cells]);
// //   // END OF NEW

// //   // const [metadata, setMetadata] = useState<NoteMetadata>({
// //   //   title: "My New Notation",
// //   //   // courseCode: "",
// //   //   // author: "",
// //   //   // dateOrPeriod: ""
// //   // });

// //   const getInitialAuthor = () => {
// //     const stored = localStorage.getItem("defaultAuthor");
// //     return stored?.trim() || undefined;
// //   };
  
// //   const [metadata, setMetadata] = useState<NoteMetadata>(() => ({
// //     title: "My New Notation",
// //     ...(getInitialAuthor() ? { author: getInitialAuthor() } : {}),
// //   }));

// //   // const addCell = (type: "math" | "text", index?: number) => {
// //   //   const newCell: CellData = {
// //   //     id: Date.now().toString(),
// //   //     type,
// //   //     content: "",
// //   //   };
// //   //   setCells((prev) => {
// //   //     if (index === undefined) return [...prev, newCell];
// //   //     return [...prev.slice(0, index), newCell, ...prev.slice(index)];
// //   //   });
// //   //   addShowLatexEntry(newCell.id);
// //   // };
// //   const addCell = (type: "math" | "text", index?: number) => {
// //     const newCell: CellData = {
// //       id: Date.now().toString(),
// //       type,
// //       content: "",
// //     };
  
// //     // Add the new cell to the list
// //     setCells((prev) => {
// //       if (index === undefined) return [...prev, newCell];
// //       return [...prev.slice(0, index), newCell, ...prev.slice(index)];
// //     });
  
// //     // Ensure showLatex is initialized
// //     addShowLatexEntry(newCell.id);
  
// //     // Initialize editor state immediately for math cells
// //     if (type === "math") {
// //       console.log(`creating math`)
// //       const root = createRootWrapper();
// //       const editorState = createEditorState(root);
// //       setEditorStates((prev) => ({
// //         ...prev,
// //         [newCell.id]: editorState,
// //       }));
// //     }
// //   };

// //   const addShowLatexEntry = (cellId: string) => {
// //     setShowLatexMap((prev) => ({ ...prev, [cellId]: false }));
// //   };

// //   // Latex view map
// //   const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});

// //   // Set all values in showLatexMap to true
// //   const showAllLatex = () => {
// //     setShowLatexMap((prev) =>
// //       Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
// //     );
// //     console.log(showLatexMap)
// //   };

// //   // Set all values in showLatexMap to false
// //   const hideAllLatex = () => {
// //     setShowLatexMap((prev) =>
// //       Object.fromEntries(Object.keys(prev).map((key) => [key, false]))
// //     );
// //   };

// //   return (
// //     <div className={styles.editorPane} style={style}>
// //       <EditorHeaderBar
// //         isPreviewMode={isPreviewMode}
// //         togglePreviewMode={() => setIsPreviewMode((p) => !p)}
// //         defaultZoom={defaultZoom}
// //         resetAllZooms={resetAllZooms}
// //         showAllLatex={showAllLatex}
// //         hideAllLatex={hideAllLatex}
// //         handleZoomChange={handleZoomChange}
// //         showZoomDropdown={showZoomDropdown}
// //         setShowZoomDropdown={setShowZoomDropdown}
// //         dropdownRef={dropdownRef}
// //         onAddCell={addCell}
// //       />
// //       <NotationEditor
// //         noteId={noteId}
// //         isPreviewMode={isPreviewMode}
// //         resetZoomSignal={resetZoomSignal}
// //         defaultZoom={defaultZoom}
// //         cells={cells}
// //         setCells={setCells}
// //         addCell={addCell}
// //         editorStates={editorStates}
// //         setEditorStates={setEditorStates}
// //         showLatexMap={showLatexMap}
// //         setShowLatexMap={setShowLatexMap}
// //         metadata={metadata}
// //         setMetadata={setMetadata}
// //         // draggedNode={draggedNode}
// //         // dropCursor={dropCursor}
// //         // dropTargetCellId={dropTargetCellId}
// //         // startDrag={startMathDrag}
// //         // updateDropTarget={updateDropTarget}
// //         // clearDrag={clearDrag}
// //         // handleDrop={handleDrop}
// //       />
// //     </div>
// //   );
// // };

// // export default EditorPane;




// // import React, { useState, useRef, useEffect } from "react";
// // import EditorHeaderBar from "./EditorHeaderBar";
// // import NotationEditor from "./NotationEditor";
// // import styles from "./Editor.module.css";
// // import type { CellData, NoteMetadata } from "../../models/noteTypes";
// // import { createEditorState, type EditorState } from "../../logic/editor-state";
// // import { createRootWrapper } from "../../models/nodeFactories";
// // import type { MathNode } from "../../models/types";

// // // Define drop types here for now (you can move them to a types file later)
// // type DropSource = {
// //   sourceType: "cell" | "library";
// //   cellId?: string;
// //   containerId: string;
// //   index: number;
// //   node: MathNode;
// // };

// // type DropTarget = {
// //   cellId: string;
// //   containerId: string;
// //   index: number;
// // };

// // interface EditorPaneProps {
// //   noteId: string | null;
// //   style?: React.CSSProperties;
// //   onDropNode: (
// //     from: DropSource,
// //     to: DropTarget,
// //     editorStates: Record<string, EditorState>,
// //     setEditorStates: React.Dispatch<React.SetStateAction<Record<string, EditorState>>>
// //   ) => void;
// // }

// // const EditorPane: React.FC<EditorPaneProps> = ({
// //   noteId,
// //   style,
// //   onDropNode,
// // }) => {
// //   // ─── UI State ─────────────────────────────
// //   const [isPreviewMode, setIsPreviewMode] = useState(() => {
// //     return localStorage.getItem("previewMode") === "on";
// //   });

// //   const [defaultZoom, setDefaultZoom] = useState(() => {
// //     const stored = localStorage.getItem("defaultZoom");
// //     return stored ? parseFloat(stored) : 1;
// //   });

// //   const [resetZoomSignal, setResetZoomSignal] = useState(0);
// //   const [showZoomDropdown, setShowZoomDropdown] = useState(false);
// //   const dropdownRef = useRef<HTMLDivElement | null>(null);

// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// //         setShowZoomDropdown(false);
// //       }
// //     };

// //     if (showZoomDropdown) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     }

// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, [showZoomDropdown]);

// //   const resetAllZooms = () => {
// //     setResetZoomSignal((n) => n + 1);
// //     localStorage.setItem("defaultZoom", String(defaultZoom));
// //   };

// //   const handleZoomChange = (value: number) => {
// //     const clamped = Math.max(0.5, Math.min(2, value));
// //     setDefaultZoom(clamped);
// //     localStorage.setItem("defaultZoom", clamped.toString());
// //     resetAllZooms();
// //   };

// //   // ─── Cell & Editor State ──────────────────
// //   const [cells, setCells] = useState<CellData[]>([]);
// //   const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({});

// //   useEffect(() => {
// //     setEditorStates((prev) => {
// //       const next: Record<string, EditorState> = {};
// //       cells.forEach((cell) => {
// //         if (cell.type === "math") {
// //           next[cell.id] = prev[cell.id] ?? createEditorState(createRootWrapper());
// //         }
// //       });
// //       return next;
// //     });
// //   }, [cells]);

// //   const addCell = (type: "math" | "text", index?: number) => {
// //     const newCell: CellData = {
// //       id: Date.now().toString(),
// //       type,
// //       content: "",
// //     };

// //     setCells((prev) => {
// //       if (index === undefined) return [...prev, newCell];
// //       return [...prev.slice(0, index), newCell, ...prev.slice(index)];
// //     });

// //     addShowLatexEntry(newCell.id);

// //     if (type === "math") {
// //       const root = createRootWrapper();
// //       const editorState = createEditorState(root);
// //       setEditorStates((prev) => ({
// //         ...prev,
// //         [newCell.id]: editorState,
// //       }));
// //     }
// //   };

// //   // ─── Metadata & Latex Toggle ───────────────
// //   const getInitialAuthor = () => {
// //     const stored = localStorage.getItem("defaultAuthor");
// //     return stored?.trim() || undefined;
// //   };

// //   const [metadata, setMetadata] = useState<NoteMetadata>(() => ({
// //     title: "My New Notation",
// //     ...(getInitialAuthor() ? { author: getInitialAuthor() } : {}),
// //   }));

// //   const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});

// //   const addShowLatexEntry = (cellId: string) => {
// //     setShowLatexMap((prev) => ({ ...prev, [cellId]: false }));
// //   };

// //   const showAllLatex = () => {
// //     setShowLatexMap((prev) =>
// //       Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
// //     );
// //   };

// //   const hideAllLatex = () => {
// //     setShowLatexMap((prev) =>
// //       Object.fromEntries(Object.keys(prev).map((key) => [key, false]))
// //     );
// //   };

// //   // ─── Render ────────────────────────────────
// //   return (
// //     <div className={styles.editorPane} style={style}>
// //       <EditorHeaderBar
// //         isPreviewMode={isPreviewMode}
// //         togglePreviewMode={() => setIsPreviewMode((p) => !p)}
// //         defaultZoom={defaultZoom}
// //         resetAllZooms={resetAllZooms}
// //         showAllLatex={showAllLatex}
// //         hideAllLatex={hideAllLatex}
// //         handleZoomChange={handleZoomChange}
// //         showZoomDropdown={showZoomDropdown}
// //         setShowZoomDropdown={setShowZoomDropdown}
// //         dropdownRef={dropdownRef}
// //         onAddCell={addCell}
// //       />

// //       <NotationEditor
// //         noteId={noteId}
// //         isPreviewMode={isPreviewMode}
// //         resetZoomSignal={resetZoomSignal}
// //         defaultZoom={defaultZoom}
// //         cells={cells}
// //         setCells={setCells}
// //         addCell={addCell}
// //         editorStates={editorStates}
// //         setEditorStates={setEditorStates}
// //         showLatexMap={showLatexMap}
// //         setShowLatexMap={setShowLatexMap}
// //         metadata={metadata}
// //         setMetadata={setMetadata}
// //         onDropNode={(from, to) => onDropNode(from, to, editorStates, setEditorStates)}
// //         />
// //     </div>
// //   );
// // };

// // export default EditorPane;

// import React, { useState, useRef, useEffect } from "react";
// import EditorHeaderBar from "./EditorHeaderBar";
// import NotationEditor from "./NotationEditor";
// import styles from "./Editor.module.css";
// import type { CellData, NoteMetadata } from "../../models/noteTypes";
// import type { MathNode } from "../../models/types";
// import { useEditorHistory } from "../../hooks/EditorHistoryContext";
// import { createRootWrapper } from "../../models/nodeFactories";
// import { createEditorState } from "../../logic/editor-state";

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

// interface EditorPaneProps {
//   noteId: string | null;
//   style?: React.CSSProperties;
//   onDropNode: (from: DropSource, to: DropTarget) => void;
// }

// const EditorPane: React.FC<EditorPaneProps> = ({
//   noteId,
//   style,
//   onDropNode,
// }) => {
//   const { history, updateState } = useEditorHistory();
//   // const editorStates = history.present;
//   const { states: editorStates, order } = history.present;

//   // const setEditorStates = (value: React.SetStateAction<typeof editorStates>) => {
//   //   if (typeof value === "function") {
//   //     updateState(value(editorStates));
//   //   } else {
//   //     updateState(value);
//   //   }
//   // };
//   const setEditorStates = (value: React.SetStateAction<typeof editorStates>) => {
//     if (typeof value === "function") {
//       const newStates = value(editorStates);
//       updateState({ states: newStates, order });
//     } else {
//       updateState({ states: value, order });
//     }
//   };

//   const [cells, setCells] = useState<CellData[]>([]);

//   const updateOrder = (newCells: CellData[]) => {
//     updateState({
//       states: history.present.states,
//       order: newCells.map(cell => cell.id),
//     });
//   };

//   // const addCell = (type: "math" | "text", index?: number) => {
//   //   const newCell: CellData = {
//   //     id: Date.now().toString(),
//   //     type,
//   //     content: "",
//   //   };

//   //   setCells((prev) => {
//   //     if (index === undefined) return [...prev, newCell];
//   //     return [...prev.slice(0, index), newCell, ...prev.slice(index)];
//   //   });
    
//   //   // Ensure showLatex is initialized
//   //   addShowLatexEntry(newCell.id);
  
//   //   // Initialize editor state immediately for math cells
//   //   if (type === "math") {
//   //     console.log(`creating math`)
//   //     const root = createRootWrapper();
//   //     const editorState = createEditorState(root);

//   //     setEditorStates((prev) => {
//   //       return {
//   //         ...prev,
//   //         [newCell.id]: editorState,
//   //       };
//   //     });

//   //     updateState({
//   //       states: {
//   //         ...editorStates,
//   //         [newCell.id]: editorState,
//   //       },
//   //       order:
//   //         index === undefined
//   //           ? [...order, newCell.id]
//   //           : [...order.slice(0, index), newCell.id, ...order.slice(index)],
//   //     });
//   //   };
//   // };

//   const addCell = (type: "math" | "text", index?: number) => {
//     const newCell: CellData = {
//       id: Date.now().toString(),
//       type,
//       content: "",
//     };
  
//     // Add the new cell
//     setCells((prev) => {
//       const newCells =
//         index === undefined
//           ? [...prev, newCell]
//           : [...prev.slice(0, index), newCell, ...prev.slice(index)];
  
//       // Sync history order with new cell layout
//       const newOrder = newCells.map((cell) => cell.id);
  
//       // If math cell, create initial state
//       if (type === "math") {
//         const root = createRootWrapper();
//         const editorState = createEditorState(root);
//         const newStates = {
//           ...editorStates,
//           [newCell.id]: editorState,
//         };
//         updateState({ states: newStates, order: newOrder });
//       } else {
//         // Non-math cell: just update order
//         updateState({ states: editorStates, order: newOrder });
//       }
  
//       // Ensure LaTeX toggle entry
//       addShowLatexEntry(newCell.id);
  
//       return newCells;
//     });
//   };
  

//   const [isPreviewMode, setIsPreviewMode] = useState(() => {
//     return localStorage.getItem("previewMode") === "on";
//   });

//   const [defaultZoom, setDefaultZoom] = useState(() => {
//     const stored = localStorage.getItem("defaultZoom");
//     return stored ? parseFloat(stored) : 1;
//   });

//   const [resetZoomSignal, setResetZoomSignal] = useState(0);
//   const [showZoomDropdown, setShowZoomDropdown] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowZoomDropdown(false);
//       }
//     };
//     if (showZoomDropdown) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showZoomDropdown]);

//   const resetAllZooms = () => {
//     setResetZoomSignal((n) => n + 1);
//     localStorage.setItem("defaultZoom", String(defaultZoom));
//   };

//   const handleZoomChange = (value: number) => {
//     const clamped = Math.max(0.5, Math.min(2, value));
//     setDefaultZoom(clamped);
//     localStorage.setItem("defaultZoom", clamped.toString());
//     resetAllZooms();
//   };

//   const getInitialAuthor = () => {
//     const stored = localStorage.getItem("defaultAuthor");
//     return stored?.trim() || undefined;
//   };

//   const [metadata, setMetadata] = useState<NoteMetadata>(() => ({
//     title: "My New Notation",
//     ...(getInitialAuthor() ? { author: getInitialAuthor() } : {}),
//   }));

//   const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});
//   const addShowLatexEntry = (cellId: string) => {
//     setShowLatexMap((prev) => ({ ...prev, [cellId]: false }));
//   };

//   const showAllLatex = () => {
//     setShowLatexMap((prev) =>
//       Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
//     );
//   };

//   const hideAllLatex = () => {
//     setShowLatexMap((prev) =>
//       Object.fromEntries(Object.keys(prev).map((key) => [key, false]))
//     );
//   };

//   return (
//     <div className={styles.editorPane} style={style}>
//       <EditorHeaderBar
//         isPreviewMode={isPreviewMode}
//         togglePreviewMode={() => setIsPreviewMode((p) => !p)}
//         defaultZoom={defaultZoom}
//         resetAllZooms={resetAllZooms}
//         showAllLatex={showAllLatex}
//         hideAllLatex={hideAllLatex}
//         handleZoomChange={handleZoomChange}
//         showZoomDropdown={showZoomDropdown}
//         setShowZoomDropdown={setShowZoomDropdown}
//         dropdownRef={dropdownRef}
//         onAddCell={addCell}
//       />

//       <NotationEditor
//         noteId={noteId}
//         isPreviewMode={isPreviewMode}
//         resetZoomSignal={resetZoomSignal}
//         defaultZoom={defaultZoom}
//         cells={cells}
//         setCells={setCells}
//         updateOrder={updateOrder}
//         addCell={addCell}
//         editorStates={editorStates}
//         setEditorStates={setEditorStates}
//         showLatexMap={showLatexMap}
//         setShowLatexMap={setShowLatexMap}
//         metadata={metadata}
//         setMetadata={setMetadata}
//         onDropNode={onDropNode}
//       />
//     </div>
//   );
// };

// export default EditorPane;

// // components/editor/EditorPane.tsx
// import React, { useState, useRef, useEffect } from "react";
// import EditorHeaderBar from "./EditorHeaderBar";
// import NotationEditor from "./NotationEditor";
// import styles from "./Editor.module.css";
// import type { CellData, NoteMetadata } from "../../models/noteTypes";
// import type { MathNode } from "../../models/types";
// import { useEditorHistory } from "../../hooks/EditorHistoryContext";
// import { createRootWrapper } from "../../models/nodeFactories";
// import { createEditorState } from "../../logic/editor-state";

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

// interface EditorPaneProps {
//   noteId: string | null;
//   style?: React.CSSProperties;
//   onDropNode: (from: DropSource, to: DropTarget) => void;
// }

// const EditorPane: React.FC<EditorPaneProps> = ({
//   noteId,
//   style,
//   onDropNode,
// }) => {
//   const { history, updateState } = useEditorHistory();
//   const { states: editorStates, order } = history.present;

//   const setEditorStates = (value: React.SetStateAction<typeof editorStates>) => {
//     if (typeof value === "function") {
//       const newStates = value(editorStates);
//       updateState({ states: newStates, order });
//     } else {
//       updateState({ states: value, order });
//     }
//   };

//   // const [cells, setCells] = useState<CellData[]>([]);

//   // Sync `order` in history whenever `cells` change
//   useEffect(() => {
//     const newOrder = cells.map((cell) => cell.id);
//     // Update history only if order changed to avoid infinite loops
//     if (
//       newOrder.length !== order.length ||
//       newOrder.some((id, i) => id !== order[i])
//     ) {
//       updateState({
//         states: editorStates,
//         order: newOrder,
//       });
//     }
//   }, [cells, editorStates, order, updateState]);

//   // Sync editorStates for new math cells
//   useEffect(() => {
//     let hasNewMathCells = false;
//     const newStates = { ...editorStates };

//     for (const cell of cells) {
//       if (cell.type === "math" && !(cell.id in editorStates)) {
//         const root = createRootWrapper();
//         const editorState = createEditorState(root);
//         newStates[cell.id] = editorState;
//         hasNewMathCells = true;
//       }
//     }

//     if (hasNewMathCells) {
//       updateState({
//         states: newStates,
//         order,
//       });
//     }
//   }, [cells, editorStates, order, updateState]);

//   // const addCell = (type: "math" | "text", index?: number) => {
//   //   const newCell: CellData = {
//   //     id: Date.now().toString(),
//   //     type,
//   //     content: "",
//   //   };

//   //   setCells((prev) => {
//   //     if (index === undefined) return [...prev, newCell];
//   //     return [...prev.slice(0, index), newCell, ...prev.slice(index)];
//   //   });

//   //   // Init showLatex entry (assuming addShowLatexEntry defined below)
//   //   addShowLatexEntry(newCell.id);

//   //   if (type === "math") {
//   //     const root = createRootWrapper();
//   //     const editorState = createEditorState(root);
//   //     setEditorStates((prev) => ({
//   //       ...prev,
//   //       [newCell.id]: editorState,
//   //     }));
//   //   }
//   // };

//   const addCell = (type: "math" | "text", index?: number) => {
//     const newCell: CellData = {
//       id: Date.now().toString(),
//       type,
//       content: "",
//     };
  
//     // Inject new cell ID into the order
//     const newOrder = [...order];
//     if (index === undefined) {
//       newOrder.push(newCell.id);
//     } else {
//       newOrder.splice(index, 0, newCell.id);
//     }
  
//     // Preserve editorStates and add the new state if math
//     const newStates = { ...editorStates };
//     if (type === "math") {
//       const root = createRootWrapper();
//       const editorState = createEditorState(root);
//       newStates[newCell.id] = editorState;
//     }
  
//     updateState({
//       order: newOrder,
//       states: newStates,
//     });
  
//     // Add new cell to NotationEditor, which now owns the actual CellData
//     // This will be passed as `onAddCell` and handled there
//     addShowLatexEntry(newCell.id);
//   };
  

//   const [isPreviewMode, setIsPreviewMode] = useState(() => {
//     return localStorage.getItem("previewMode") === "on";
//   });

//   const [defaultZoom, setDefaultZoom] = useState(() => {
//     const stored = localStorage.getItem("defaultZoom");
//     return stored ? parseFloat(stored) : 1;
//   });

//   const [resetZoomSignal, setResetZoomSignal] = useState(0);
//   const [showZoomDropdown, setShowZoomDropdown] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowZoomDropdown(false);
//       }
//     };
//     if (showZoomDropdown) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showZoomDropdown]);

//   const updateOrder = (newCells: CellData[]) => {
//     setCells(newCells);
//   };

//   const resetAllZooms = () => {
//     setResetZoomSignal((n) => n + 1);
//     localStorage.setItem("defaultZoom", String(defaultZoom));
//   };

//   const handleZoomChange = (value: number) => {
//     const clamped = Math.max(0.5, Math.min(2, value));
//     setDefaultZoom(clamped);
//     localStorage.setItem("defaultZoom", clamped.toString());
//     resetAllZooms();
//   };

//   const getInitialAuthor = () => {
//     const stored = localStorage.getItem("defaultAuthor");
//     return stored?.trim() || undefined;
//   };

//   const [metadata, setMetadata] = useState<NoteMetadata>(() => ({
//     title: "My New Notation",
//     ...(getInitialAuthor() ? { author: getInitialAuthor() } : {}),
//   }));

//   const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});

//   const addShowLatexEntry = (cellId: string) => {
//     setShowLatexMap((prev) => ({ ...prev, [cellId]: false }));
//   };

//   const showAllLatex = () => {
//     setShowLatexMap((prev) =>
//       Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
//     );
//   };

//   const hideAllLatex = () => {
//     setShowLatexMap((prev) =>
//       Object.fromEntries(Object.keys(prev).map((key) => [key, false]))
//     );
//   };

//   return (
//     <div className={styles.editorPane} style={style}>
//       <EditorHeaderBar
//         isPreviewMode={isPreviewMode}
//         togglePreviewMode={() => setIsPreviewMode((p) => !p)}
//         defaultZoom={defaultZoom}
//         resetAllZooms={resetAllZooms}
//         showAllLatex={showAllLatex}
//         hideAllLatex={hideAllLatex}
//         handleZoomChange={handleZoomChange}
//         showZoomDropdown={showZoomDropdown}
//         setShowZoomDropdown={setShowZoomDropdown}
//         dropdownRef={dropdownRef}
//         onAddCell={addCell}
//       />

//       <NotationEditor
//         // noteId={noteId}
//         // isPreviewMode={isPreviewMode}
//         // resetZoomSignal={resetZoomSignal}
//         // defaultZoom={defaultZoom}
//         // cells={cells}
//         // setCells={setCells}
//         // addCell={addCell}
//         // editorStates={editorStates}
//         // setEditorStates={setEditorStates}
//         // showLatexMap={showLatexMap}
//         // setShowLatexMap={setShowLatexMap}
//         // metadata={metadata}
//         // setMetadata={setMetadata}
//         // onDropNode={onDropNode}
//         noteId={noteId}
//         isPreviewMode={isPreviewMode}
//         resetZoomSignal={resetZoomSignal}
//         defaultZoom={defaultZoom}
//         // cells={cells}
//         // setCells={setCells}
//         order={order}
//         editorStates={editorStates}
//         updateOrder={updateOrder}
//         addCell={addCell}
//         // editorStates={editorStates}
//         setEditorStates={setEditorStates}
//         showLatexMap={showLatexMap}
//         setShowLatexMap={setShowLatexMap}
//         metadata={metadata}
//         setMetadata={setMetadata}
//         onDropNode={onDropNode}
//       />
//     </div>
//   );
// };

// export default EditorPane;



// // components/editor/EditorPane.tsx
// import React, { useState, useRef, useEffect } from "react";
// import EditorHeaderBar from "./EditorHeaderBar";
// import NotationEditor from "./NotationEditor";
// import styles from "./Editor.module.css";
// import type { CellData, NoteMetadata } from "../../models/noteTypes";
// import type { MathNode } from "../../models/types";
// import { useEditorHistory } from "../../hooks/EditorHistoryContext";
// import { createRootWrapper } from "../../models/nodeFactories";
// import { createEditorState } from "../../logic/editor-state";

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

// interface EditorPaneProps {
//   noteId: string | null;
//   noteMetadata: NoteMetadata;
//   // updateNoteMetadata: Dispatch<SetStateAction<NoteMetadata>>;
//   setNoteMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
//   noteCells: CellData[];
//   setNoteCells: (noteId: string, newCells: CellData[]) => void;
//   style?: React.CSSProperties;
//   onDropNode: (from: DropSource, to: DropTarget) => void;
// }

// const EditorPane: React.FC<EditorPaneProps> = ({
//   noteId,
//   noteMetadata,
//   setNoteMetadata,
//   noteCells,
//   setNoteCells,
//   style,
//   onDropNode,
// }) => {
//   const { history, updateState } = useEditorHistory();
//   const { states: editorStates, order, textContents } = history.present;

//   // update text contents
//   const setTextContents = (value: React.SetStateAction<typeof textContents>) => {
//     console.log(`trreachted with ${value} ${typeof value === "function" ? value(textContents) : "problem"}`)
//     if (typeof value === "function") {
//       const newContents = value(textContents);
//       updateState({ states: editorStates, order, textContents: newContents });
//     } else {
//       updateState({ states: editorStates, order, textContents: value });
//     }
//   };

//   // update editorStates safely
//   const setEditorStates = (value: React.SetStateAction<typeof editorStates>) => {
//     if (typeof value === "function") {
//       const newStates = value(editorStates);
//       updateState({ states: newStates, order, textContents });
//     } else {
//       updateState({ states: value, order, textContents });
//     }
//   };

//   // Removed cells state and syncing effects

//   const addShowLatexEntry = (cellId: string) => {
//     setShowLatexMap((prev) => ({ ...prev, [cellId]: false }));
//   };

//   const addCell = (type: "math" | "text", index?: number) => {
//     const newCell: CellData = {
//       id: Date.now().toString(),
//       type,
//       content: "",
//     };

//     // Insert new cell ID into the order array at specified index or at the end
//     const newOrder = [...order];
//     if (index === undefined) {
//       newOrder.push(newCell.id);
//     } else {
//       newOrder.splice(index, 0, newCell.id);
//     }

//     // If math cell, create initial editor state for it
//     const newStates = { ...editorStates };
//     if (type === "math") {
//       const root = createRootWrapper();
//       const editorState = createEditorState(root);
//       newStates[newCell.id] = editorState;
//     }

//     updateState({
//       order: newOrder,
//       states: newStates,
//       textContents: textContents,
//     });

//     addShowLatexEntry(newCell.id);
//   };

//   const deleteCell = (id: string) => {
//     const newOrder = order.filter((cellId) => cellId !== id);
//     const newStates = { ...editorStates };
//     delete newStates[id];
//     const newTextContents = { ...textContents };
//     delete newTextContents[id];
  
//     setShowLatexMap((prev) => {
//       const copy = { ...prev };
//       delete copy[id];
//       return copy;
//     });
  
//     updateState({
//       order: newOrder,
//       states: newStates,
//       textContents: newTextContents,
//     });
//   };

//   // Implement updateOrder to update just the order array:
//   const updateOrder = (newOrder: string[]) => {
//     updateState({
//       order: newOrder,
//       states: editorStates,
//       textContents: textContents,
//     });
//   };

//   // Preview mode toggle
//   const [isPreviewMode, setIsPreviewMode] = useState(() => {
//     return localStorage.getItem("previewMode") === "on";
//   });

//   // Default zoom state
//   const [defaultZoom, setDefaultZoom] = useState(() => {
//     const stored = localStorage.getItem("defaultZoom");
//     return stored ? parseFloat(stored) : 1;
//   });

//   const [resetZoomSignal, setResetZoomSignal] = useState(0);
//   const [showZoomDropdown, setShowZoomDropdown] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     // reload editor state for new noteId
//   }, [noteId]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setShowZoomDropdown(false);
//       }
//     };
//     if (showZoomDropdown) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showZoomDropdown]);

//   const resetAllZooms = () => {
//     setResetZoomSignal((n) => n + 1);
//     localStorage.setItem("defaultZoom", String(defaultZoom));
//   };

//   const handleZoomChange = (value: number) => {
//     const clamped = Math.max(0.5, Math.min(2, value));
//     setDefaultZoom(clamped);
//     localStorage.setItem("defaultZoom", clamped.toString());
//     resetAllZooms();
//   };

//   // Metadata state and initialization
//   // const getInitialAuthor = () => {
//   //   const stored = localStorage.getItem("defaultAuthor");
//   //   return stored?.trim() || undefined;
//   // };

//   // const [metadata, setMetadata] = useState<NoteMetadata>(() => ({
//   //   title: "My New Notation",
//   //   ...(getInitialAuthor() ? { author: getInitialAuthor() } : {}),
//   // }));

//   // Show/hide LaTeX map
//   const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});

//   const showAllLatex = () => {
//     setShowLatexMap((prev) =>
//       Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
//     );
//   };

//   const hideAllLatex = () => {
//     setShowLatexMap((prev) =>
//       Object.fromEntries(Object.keys(prev).map((key) => [key, false]))
//     );
//   };

//   return (
//     <div className={styles.editorPane} style={style}>
//       <EditorHeaderBar
//         isPreviewMode={isPreviewMode}
//         togglePreviewMode={() => setIsPreviewMode((p) => !p)}
//         defaultZoom={defaultZoom}
//         resetAllZooms={resetAllZooms}
//         showAllLatex={showAllLatex}
//         hideAllLatex={hideAllLatex}
//         handleZoomChange={handleZoomChange}
//         showZoomDropdown={showZoomDropdown}
//         setShowZoomDropdown={setShowZoomDropdown}
//         dropdownRef={dropdownRef}
//         onAddCell={addCell}
//       />

//       <NotationEditor
//         noteId={noteId}
//         isPreviewMode={isPreviewMode}
//         resetZoomSignal={resetZoomSignal}
//         defaultZoom={defaultZoom}
//         order={order}
//         addCell={addCell}
//         deleteCell={deleteCell}
//         updateOrder={updateOrder}
//         editorStates={editorStates}
//         setEditorStates={setEditorStates}
//         textContents={textContents}
//         setTextContents={setTextContents}
//         showLatexMap={showLatexMap}
//         setShowLatexMap={setShowLatexMap}
//         metadata={noteMetadata}
//         setMetadata={setNoteMetadata}
//         onDropNode={onDropNode}
//       />
//     </div>
//   );
// };

// export default EditorPane;

// // components/editor/EditorPane.tsx
// import React, { useState, useRef, useEffect } from "react";
// import EditorHeaderBar from "./EditorHeaderBar";
// import NotationEditor from "./NotationEditor";
// import styles from "./Editor.module.css";
// import type { CellData, NoteMetadata } from "../../models/noteTypes";
// import type { MathNode } from "../../models/types";
// import { useEditorHistory } from "../../hooks/EditorHistoryContext";
// import { createRootWrapper } from "../../models/nodeFactories";
// import { createEditorState } from "../../logic/editor-state";

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

// interface EditorPaneProps {
//   noteId: string | null;
//   noteMetadata: NoteMetadata;
//   setNoteMetadata: (noteId: string, metadata: Partial<NoteMetadata>) => void;
//   style?: React.CSSProperties;
//   onDropNode: (from: DropSource, to: DropTarget) => void;
// }

// const EditorPane: React.FC<EditorPaneProps> = ({
//   noteId,
//   noteMetadata,
//   setNoteMetadata,
//   style,
//   onDropNode,
// }) => {
//   const { history, updateState } = useEditorHistory();
//   const { states: editorStates, order, textContents } = history.present;

//   // Update textContents safely
//   const setTextContents = (value: React.SetStateAction<typeof textContents>) => {
//     if (typeof value === "function") {
//       const newContents = value(textContents);
//       updateState({ states: editorStates, order, textContents: newContents });
//     } else {
//       updateState({ states: editorStates, order, textContents: value });
//     }
//   };

//   // Update editorStates safely
//   const setEditorStates = (value: React.SetStateAction<typeof editorStates>) => {
//     if (typeof value === "function") {
//       const newStates = value(editorStates);
//       updateState({ states: newStates, order, textContents });
//     } else {
//       updateState({ states: value, order, textContents });
//     }
//   };

//   // Add new showLatex entry when adding new cell
//   const addShowLatexEntry = (cellId: string) => {
//     setShowLatexMap((prev) => ({ ...prev, [cellId]: false }));
//   };

//   // Add a new cell (math or text) at optional index
//   const addCell = (type: "math" | "text", index?: number) => {
//     const newCell: CellData = {
//       id: Date.now().toString(),
//       type,
//       content: "",
//     };

//     // Insert new cell ID into order array
//     const newOrder = [...order];
//     if (index === undefined) {
//       newOrder.push(newCell.id);
//     } else {
//       newOrder.splice(index, 0, newCell.id);
//     }

//     // If math cell, create initial editor state
//     const newStates = { ...editorStates };
//     if (type === "math") {
//       const root = createRootWrapper();
//       const editorState = createEditorState(root);
//       newStates[newCell.id] = editorState;
//     }

//     updateState({
//       order: newOrder,
//       states: newStates,
//       textContents,
//     });

//     addShowLatexEntry(newCell.id);
//   };

//   // Delete a cell by id
//   const deleteCell = (id: string) => {
//     const newOrder = order.filter((cellId) => cellId !== id);
//     const newStates = { ...editorStates };
//     delete newStates[id];
//     const newTextContents = { ...textContents };
//     delete newTextContents[id];

//     setShowLatexMap((prev) => {
//       const copy = { ...prev };
//       delete copy[id];
//       return copy;
//     });

//     updateState({
//       order: newOrder,
//       states: newStates,
//       textContents: newTextContents,
//     });
//   };

//   // Update order only
//   const updateOrder = (newOrder: string[]) => {
//     updateState({
//       order: newOrder,
//       states: editorStates,
//       textContents,
//     });
//   };

//   // Preview mode state with localStorage persistence
//   const [isPreviewMode, setIsPreviewMode] = useState(() => {
//     return localStorage.getItem("previewMode") === "on";
//   });

//   // Default zoom state with persistence
//   const [defaultZoom, setDefaultZoom] = useState(() => {
//     const stored = localStorage.getItem("defaultZoom");
//     return stored ? parseFloat(stored) : 1;
//   });

//   const [resetZoomSignal, setResetZoomSignal] = useState(0);
//   const [showZoomDropdown, setShowZoomDropdown] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     // Placeholder: reload editor state for new noteId if needed
//   }, [noteId]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setShowZoomDropdown(false);
//       }
//     };
//     if (showZoomDropdown) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showZoomDropdown]);

//   const resetAllZooms = () => {
//     setResetZoomSignal((n) => n + 1);
//     localStorage.setItem("defaultZoom", String(defaultZoom));
//   };

//   const handleZoomChange = (value: number) => {
//     const clamped = Math.max(0.5, Math.min(2, value));
//     setDefaultZoom(clamped);
//     localStorage.setItem("defaultZoom", clamped.toString());
//     resetAllZooms();
//   };

//   // Show/hide LaTeX map per cell
//   const [showLatexMap, setShowLatexMap] = useState<Record<string, boolean>>({});

//   const showAllLatex = () => {
//     setShowLatexMap((prev) =>
//       Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
//     );
//   };

//   const hideAllLatex = () => {
//     setShowLatexMap((prev) =>
//       Object.fromEntries(Object.keys(prev).map((key) => [key, false]))
//     );
//   };

//   return (
//     <div className={styles.editorPane} style={style}>
//       <EditorHeaderBar
//         isPreviewMode={isPreviewMode}
//         togglePreviewMode={() => setIsPreviewMode((p) => !p)}
//         defaultZoom={defaultZoom}
//         resetAllZooms={resetAllZooms}
//         showAllLatex={showAllLatex}
//         hideAllLatex={hideAllLatex}
//         handleZoomChange={handleZoomChange}
//         showZoomDropdown={showZoomDropdown}
//         setShowZoomDropdown={setShowZoomDropdown}
//         dropdownRef={dropdownRef}
//         onAddCell={addCell}
//       />

//       <NotationEditor
//         noteId={noteId}
//         isPreviewMode={isPreviewMode}
//         resetZoomSignal={resetZoomSignal}
//         defaultZoom={defaultZoom}
//         order={order}
//         addCell={addCell}
//         deleteCell={deleteCell}
//         updateOrder={updateOrder}
//         editorStates={editorStates}
//         setEditorStates={setEditorStates}
//         textContents={textContents}
//         setTextContents={setTextContents}
//         showLatexMap={showLatexMap}
//         setShowLatexMap={setShowLatexMap}
//         metadata={noteMetadata}
//         setMetadata={setNoteMetadata}
//         onDropNode={onDropNode}
//       />
//     </div>
//   );
// };

// export default EditorPane;

// components/editor/EditorPane.tsx
import React, { useState, useRef, useEffect } from "react";
import EditorHeaderBar from "./EditorHeaderBar";
import NotationEditor from "./NotationEditor";
import styles from "./Editor.module.css";
import type { NoteMetadata } from "../../models/noteTypes";
import type { MathNode } from "../../models/types";
import { useEditorHistory } from "../../hooks/EditorHistoryContext";
import { createRootWrapper } from "../../models/nodeFactories";
import { createEditorState, type EditorState } from "../../logic/editor-state";

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
