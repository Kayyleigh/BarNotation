// // components/layout/MainLayout.tsx
// import React, { useState, useEffect } from "react";
// import HeaderBar from "./MainHeaderBar";
// import NotesMenu from "../notesMenu/NotesMenu";
// import EditorWorkspace from "./EditorWorkspace";
// import HotkeyOverlay from "../modals/HotkeyOverlay";
// import SettingsModal from "../modals/SettingsModal";
// import "../../styles/themes.css";
// import "../../styles/styles.css";
// import "../../styles/math-node.css";
// import "../../styles/cells.css";
// import { DragProvider } from "../../hooks/DragProvider";
// import { EditorHistoryProvider } from "../../hooks/EditorHistoryProvider";
// import { createInitialCursor } from "../../logic/cursor";
// import { createRootWrapper } from "../../models/nodeFactories";
// import type { EditorSnapshot } from "../../logic/global-history";

// // 🔧 TEMP: Replace this with actual loading logic later
// // function loadEditorStatesForNote(noteId: string): Record<string, EditorState> {
// //   const rootNode = createRootWrapper();

// //   return {
// //     [noteId]: {
// //       rootNode,
// //       cursor: createInitialCursor(rootNode),
// //     },
// //   };
// // }
// function loadEditorSnapshotForNote(noteId: string): EditorSnapshot {
//   const rootNode = createRootWrapper();

//   return {
//     states: {
//       [noteId]: {
//         rootNode,
//         cursor: createInitialCursor(rootNode),
//       },
//     },
//     order: [noteId],
//     textContents: {},
//   };
// }

// // function loadNewEmptyNote(): EditorSnapshot {
// //   return {
// //     states: {},
// //     order: [],
// //   };
// // }

// const MainLayout: React.FC = () => {
//   const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
//   const [leftWidth, setLeftWidth] = useState(200);
//   const [rightWidth, setRightWidth] = useState(600);
//   const [showSettings, setShowSettings] = useState(false);
//   const [showHotkeys, setShowHotkeys] = useState(false);

//   const [initialSnapshot, setInitialSnapshot] = useState<EditorSnapshot | null>(null);

//   // === Settings state ===
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     return localStorage.getItem("mathEditorTheme") === "dark";
//   });

//   const [showColorInPreview, setShowColorInPreview] = useState(() => {
//     return localStorage.getItem("showColorInPreview") === "true";
//   });

//   const toggleDarkMode = () => setIsDarkMode(prev => !prev);
//   const toggleShowColorInPreview = () => setShowColorInPreview(prev => !prev);

//   const [authorName, setAuthorName] = useState(() => {
//     return localStorage.getItem("defaultAuthor") || "";
//   });

//   useEffect(() => {
//     localStorage.setItem("defaultAuthor", authorName);
//   }, [authorName]);

//   useEffect(() => {
//     document.body.classList.toggle("dark", isDarkMode);
//     localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   useEffect(() => {
//     localStorage.setItem("showColorInPreview", showColorInPreview ? "true" : "false");
//   }, [showColorInPreview]);

//   // === Load note when selected ===
//   // useEffect(() => {
//   //   if (selectedNoteId) {
//   //     const loadedStates = loadEditorStatesForNote(selectedNoteId);
//   //     setInitialEditorStates(loadedStates);
//   //   } else {
//   //     setInitialEditorStates(null);
//   //   }
//   // }, [selectedNoteId]);

//   useEffect(() => {
//     if (selectedNoteId) {
//       const loadedSnapshot = loadEditorSnapshotForNote(selectedNoteId);
//       setInitialSnapshot(loadedSnapshot);
//     } else {
//       setInitialSnapshot(null);
//     }
//   }, [selectedNoteId]);

//   return (
//     <div className="main-layout">
//       <HeaderBar
//         onOpenSettings={() => setShowSettings(true)}
//         onOpenHotkeys={() => setShowHotkeys(true)}
//       />
//       <div style={{ display: "flex", height: "calc(100vh - 50px)", width: "100%" }}>
//         {/* Left sidebar */}
//         <div style={{ flex: "0 0 auto", width: `${leftWidth}px` }}>
//           <NotesMenu
//             width={leftWidth}
//             onWidthChange={setLeftWidth}
//             selectedNoteId={selectedNoteId}
//             onSelectNote={setSelectedNoteId}
//           />
//           </div>
//           {/* Center area */}
//           <div style={{ flexGrow: 1, display: "flex", minWidth: 0 }}>
//             {selectedNoteId && initialSnapshot ? (
//               <EditorHistoryProvider initialSnapshot={initialSnapshot}>
//                 <DragProvider>
//                   <EditorWorkspace
//                     noteId={selectedNoteId}
//                     rightWidth={rightWidth}
//                     setRightWidth={setRightWidth}
//                   />
//                 </DragProvider>
//               </EditorHistoryProvider>
//             ) : (
//               <div style={{ padding: "2rem" }}>
//                 <h2>Select a note or create a new one</h2>
//                 <button className="button primary" onClick={() => setSelectedNoteId("note-4")}>
//                   Create Temporary Note
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       {/* Modals */}
//       {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
//       {showSettings && (
//         <SettingsModal
//           onClose={() => setShowSettings(false)}
//           isDarkMode={isDarkMode}
//           toggleDarkMode={toggleDarkMode}
//           showColorInPreview={showColorInPreview}
//           toggleShowColorInPreview={toggleShowColorInPreview}
//           authorName={authorName}
//           setAuthorName={setAuthorName}
//         />
//       )}
//     </div>
//   );
// };

// export default MainLayout;

// import React, { useState, useEffect } from "react";
// import HeaderBar from "./MainHeaderBar";
// import NotesMenu from "../notesMenu/NotesMenu";
// import EditorWorkspace from "./EditorWorkspace";
// import HotkeyOverlay from "../modals/HotkeyOverlay";
// import SettingsModal from "../modals/SettingsModal";
// import "../../styles/themes.css";
// import "../../styles/styles.css";
// import "../../styles/math-node.css";
// import "../../styles/cells.css";
// import { DragProvider } from "../../hooks/DragProvider";
// import { EditorHistoryProvider } from "../../hooks/EditorHistoryProvider";
// import { createInitialCursor } from "../../logic/cursor";
// import { createRootWrapper } from "../../models/nodeFactories";
// import type { EditorSnapshot } from "../../logic/global-history";
// import type { CellData, NoteMetadata } from "../../models/noteTypes";

// interface Note {
//   id: string;
//   metadata: NoteMetadata;
//   cells: CellData[];
// }

// function loadEditorSnapshotForNote(noteId: string): EditorSnapshot {
//   const rootNode = createRootWrapper();

//   return {
//     states: {
//       [noteId]: {
//         rootNode,
//         cursor: createInitialCursor(rootNode),
//       },
//     },
//     order: [noteId],
//     textContents: {},
//   };
// }

// const LOCAL_STORAGE_KEY = "notes";

// const MainLayout: React.FC = () => {
//   // const [notes, setNotes] = useState<Note[]>([]);
//   // const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
//   const [leftWidth, setLeftWidth] = useState(200);
//   const [rightWidth, setRightWidth] = useState(600);
//   const [showSettings, setShowSettings] = useState(false);
//   const [showHotkeys, setShowHotkeys] = useState(false);


//   const [notes, setNotes] = useState<Note[]>([]);
//   const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length ? notes[0].id : null);


//   const [initialSnapshot, setInitialSnapshot] = useState<EditorSnapshot | null>(null);


//   // === Settings state ===
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     return localStorage.getItem("mathEditorTheme") === "dark";
//   });

//   const [showColorInPreview, setShowColorInPreview] = useState(() => {
//     return localStorage.getItem("showColorInPreview") === "true";
//   });

//   const toggleDarkMode = () => setIsDarkMode(prev => !prev);
//   const toggleShowColorInPreview = () => setShowColorInPreview(prev => !prev);

//   const [authorName, setAuthorName] = useState(() => {
//     return localStorage.getItem("defaultAuthor") || "";
//   });

//   useEffect(() => {
//     localStorage.setItem("defaultAuthor", authorName);
//   }, [authorName]);

//   useEffect(() => {
//     document.body.classList.toggle("dark", isDarkMode);
//     localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   useEffect(() => {
//     localStorage.setItem("showColorInPreview", showColorInPreview ? "true" : "false");
//   }, [showColorInPreview]);

//   // Load notes from localStorage on mount
//   useEffect(() => {
//     const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
//     if (saved) {
//       try {
//         const parsed: Note[] = JSON.parse(saved);
//         setNotes(parsed);
//         if (parsed.length > 0) {
//           setSelectedNoteId(parsed[0].id); // Select first note by default
//         }
//       } catch {
//         // Ignore parse errors, start fresh
//       }
//     }
//   }, []);

//   // Save notes to localStorage on change
//   useEffect(() => {
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
//   }, [notes]);


//   // Get currently selected note data:
//   const selectedNote = notes.find(note => note.id === selectedNoteId) ?? null;

//   // Handler to update metadata (like title) of a note:
//   const updateNoteMetadata = (noteId: string, newMetadata: Partial<NoteMetadata>) => {
//     setNotes((prevNotes) =>
//       prevNotes.map(note =>
//         note.id === noteId ? { ...note, metadata: { ...note.metadata, ...newMetadata } } : note
//       )
//     );
//   };

//     // Handler to update cells of a note:
//     const updateNoteCells = (noteId: string, newCells: CellData[]) => {
//       setNotes((prevNotes) =>
//         prevNotes.map(note =>
//           note.id === noteId ? { ...note, cells: newCells } : note
//         )
//       );
//     };

//   // Load editor snapshot when note selected
//   useEffect(() => {
//     if (selectedNoteId) {
//       const loadedSnapshot = loadEditorSnapshotForNote(selectedNoteId);
//       setInitialSnapshot(loadedSnapshot);
//     } else {
//       setInitialSnapshot(null);
//     }
//   }, [selectedNoteId]);

//   const createNewNote = () => {
//     const newId = `note-${Date.now()}`;
//     const newNote: Note = {
//       id: newId,
//       metadata: {
//         title: "Untitled Note",
//         courseCode: "",
//         author: authorName,   // optionally use default author
//         dateOrPeriod: "",
//         archived: false,
//       },
//       cells: [],
//     };
//     setNotes((prev) => [newNote, ...prev]);
//     setSelectedNoteId(newId);
//   };

//   return (
//     <div className="main-layout">
//       <HeaderBar
//         onOpenSettings={() => setShowSettings(true)}
//         onOpenHotkeys={() => setShowHotkeys(true)}
//       />
//       <div style={{ display: "flex", height: "calc(100vh - 50px)", width: "100%" }}>
//         <div style={{ flex: "0 0 auto", width: `${leftWidth}px` }}>
//           <NotesMenu
//             width={leftWidth}
//             onWidthChange={setLeftWidth}
//             selectedNoteId={selectedNoteId}
//             onSelectNote={setSelectedNoteId}
//             notes={notes}
//             onCreateNote={createNewNote}
//           />
//         </div>
//         <div style={{ flexGrow: 1, display: "flex", minWidth: 0 }}>
//           {selectedNoteId && selectedNote && initialSnapshot ? (
//             <EditorHistoryProvider initialSnapshot={initialSnapshot}>
//               <DragProvider>
//                 <EditorWorkspace
//                   noteId={selectedNoteId}
//                   rightWidth={rightWidth}
//                   setRightWidth={setRightWidth}
//                   noteMetadata={selectedNote?.metadata}
//                   setNoteMetadata={updateNoteMetadata}
//                   noteCells={selectedNote?.cells}
//                   setNoteCells={updateNoteCells}
//                 />
//               </DragProvider>
//             </EditorHistoryProvider>
//           ) : (
//             <div style={{ padding: "2rem" }}>
//               <h2>Select a note or create a new one</h2>
//               <button className="button primary" onClick={() => {
//                 createNewNote();
//               }}>
//                 Create Temporary Note
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
//       {showSettings && (
//         <SettingsModal
//           onClose={() => setShowSettings(false)}
//           isDarkMode={isDarkMode}
//           toggleDarkMode={toggleDarkMode}
//           showColorInPreview={showColorInPreview}
//           toggleShowColorInPreview={toggleShowColorInPreview}
//           authorName={authorName}
//           setAuthorName={setAuthorName}
//         />
//       )}
//     </div>
//   );
// };

// export default MainLayout;

import React, { useState, useEffect } from "react"; 
import HeaderBar from "./MainHeaderBar";
import NotesMenu from "../notesMenu/NotesMenu";
import EditorWorkspace from "./EditorWorkspace";
import HotkeyOverlay from "../modals/HotkeyOverlay";
import SettingsModal from "../modals/SettingsModal";
import "../../styles/themes.css";
import "../../styles/styles.css";
import "../../styles/math-node.css";
import "../../styles/cells.css";
import { DragProvider } from "../../hooks/DragProvider";
import { EditorHistoryProvider } from "../../hooks/EditorHistoryProvider";
import { createInitialCursor } from "../../logic/cursor";
import { createRootWrapper } from "../../models/nodeFactories";
import { createEmptySnapshot, type EditorSnapshot } from "../../logic/global-history";
import type { CellData, NoteMetadata } from "../../models/noteTypes";

interface Note {
  id: string;
  metadata: NoteMetadata;
  cells: CellData[];
}

function loadEditorSnapshotForNote(noteId: string): EditorSnapshot {
  const rootNode = createRootWrapper();

  return {
    states: {
      [noteId]: {
        rootNode,
        cursor: createInitialCursor(rootNode),
      },
    },
    order: [noteId],
    textContents: {},
  };
}

const LOCAL_STORAGE_KEY = "notes";

const MainLayout: React.FC = () => {
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(600);
  const [showSettings, setShowSettings] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length ? notes[0].id : null);

  //const [initialSnapshot, setInitialSnapshot] = useState<EditorSnapshot | null>(null);
  const initialSnapshot: EditorSnapshot = selectedNoteId
  ? loadEditorSnapshotForNote(selectedNoteId)
  : createEmptySnapshot(); // ← Safe fallback
  
  // === Settings state ===
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mathEditorTheme") === "dark";
  });

  const [showColorInPreview, setShowColorInPreview] = useState(() => {
    return localStorage.getItem("showColorInPreview") === "true";
  });

  const [nerdMode, setNerdMode] = useState(() => {
    return localStorage.getItem("nerdMode") === "false";
  });

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const toggleShowColorInPreview = () => {
    console.log(`You want to toggle color setting`)
    setShowColorInPreview(prev => !prev);
  }

  const toggleNerdMode = () => {
    console.log(`Toggling nerd mode`)
    setNerdMode(prev => !prev);
  }

  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem("defaultAuthor") || "";
  });

  useEffect(() => {
    localStorage.setItem("defaultAuthor", authorName);
  }, [authorName]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    document.body.classList.toggle("unColoredPreview", !showColorInPreview);
    localStorage.setItem("showColorInPreview", showColorInPreview ? "true" : "false");
  }, [showColorInPreview]);

  useEffect(() => {
    document.body.classList.toggle("nerdMode", nerdMode);
    localStorage.setItem("nerdMode", nerdMode ? "true" : "false");
  }, [nerdMode]);

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Note[] = JSON.parse(saved);
        setNotes(parsed);
        if (parsed.length > 0) {
          setSelectedNoteId(parsed[0].id); // Select first note by default
        }
      } catch {
        // Ignore parse errors, start fresh
      }
    }
  }, []);

  // Save notes to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Get currently selected note data:
  const selectedNote = notes.find(note => note.id === selectedNoteId) ?? null;

  // Handler to update metadata (like title) of a note:
  const updateNoteMetadata = (noteId: string, newMetadata: Partial<NoteMetadata>) => {
    setNotes((prevNotes) =>
      prevNotes.map(note =>
        note.id === noteId ? { ...note, metadata: { ...note.metadata, ...newMetadata } } : note
      )
    );
  };

  // Handler to update cells of a note:
  const updateNoteCells = (noteId: string, newCells: CellData[]) => {
    setNotes((prevNotes) =>
      prevNotes.map(note =>
        note.id === noteId ? { ...note, cells: newCells } : note
      )
    );
  };

  // // Load editor snapshot when note selected
  // useEffect(() => {
  //   if (selectedNoteId) {
  //     const loadedSnapshot = loadEditorSnapshotForNote(selectedNoteId);
  //     setInitialSnapshot(loadedSnapshot);
  //   } else {
  //     setInitialSnapshot(null);
  //   }
  // }, [selectedNoteId]);

  const createNewNote = () => {
    const newId = `note-${Date.now()}`;
    const newNote: Note = {
      id: newId,
      metadata: {
        title: "My New Note",
        courseCode: "",
        author: authorName,
        dateOrPeriod: "",
        archived: false,
        createdAt: Date.now(),
      },
      cells: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newId);
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };
  
  const archiveNote = (id: string) => {
    updateNoteMetadata(id, { archived: true });
  };
  
  const duplicateNote = (id: string) => {
    const original = notes.find(note => note.id === id);
    if (!original) return;
  
    const newId = `note-${Date.now()}`;
    const duplicatedNote: Note = {
      ...original,
      id: newId,
      metadata: {
        ...original.metadata,
        title: `${original.metadata.title} (Copy)`,
        createdAt: Date.now(), 
      },
      cells: {
        ...original.cells,
      }
    };
  
    setNotes(prevNotes => [duplicatedNote, ...prevNotes]);
    setSelectedNoteId(newId);
  };
  
  const exportLatex = (id: string) => {
    // const note = notes.find(n => n.id === id);
    // if (!note) return;
  
    // const latexContent = note.cells.map(cell => cell.content).join("\n\n"); // Simple example
    // const blob = new Blob([latexContent], { type: "text/plain" });
    // const link = document.createElement("a");
    // link.href = URL.createObjectURL(blob);
    // link.download = `${note.metadata.title || "note"}.tex`;
    // link.click();
    console.warn(`Not yet implemented: exportLatex`)
  };

  return (
    <div className="main-layout">
      <HeaderBar
        onOpenSettings={() => setShowSettings(true)}
        onOpenHotkeys={() => setShowHotkeys(true)}
      />
      <div style={{ display: "flex", height: "calc(100vh - 50px)", width: "100%" }}>
        <div style={{ flex: "0 0 auto", width: `${leftWidth}px` }}>
          <NotesMenu
            width={leftWidth}
            onWidthChange={setLeftWidth}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            notes={notes}
            onCreateNote={createNewNote} 
            onDeleteNote={deleteNote}
            onArchiveNote={archiveNote}
            onDuplicateNote={duplicateNote}
            onExportLatex={exportLatex}     
          />
        </div>
        <div style={{ flexGrow: 1, display: "flex", minWidth: 0 }}>
          {/* {selectedNoteId && selectedNote && initialSnapshot ? ( */}
            <EditorHistoryProvider initialSnapshot={initialSnapshot}>
              <DragProvider>
                <EditorWorkspace
                  noteId={selectedNoteId}
                  rightWidth={rightWidth}
                  setRightWidth={setRightWidth}
                  noteMetadata={selectedNote?.metadata}
                  setNoteMetadata={updateNoteMetadata}
                  noteCells={selectedNote?.cells}
                  setNoteCells={updateNoteCells}
                />
              </DragProvider>
            </EditorHistoryProvider>
          {/* ) : (
            <div style={{ padding: "2rem" }}>
              <h2>Select a note or create a new one</h2>
              <button className="button primary" onClick={createNewNote}>
                Create Temporary Note
              </button>
            </div>
          )} */}
        </div>
      </div>

      {showHotkeys && <HotkeyOverlay onClose={() => setShowHotkeys(false)} />}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          showColorInPreview={showColorInPreview}
          toggleShowColorInPreview={toggleShowColorInPreview}
          authorName={authorName}
          setAuthorName={setAuthorName}
          nerdMode={nerdMode}
          toggleNerdMode={toggleNerdMode}
        />
      )}
    </div>
  );
};

export default MainLayout;

