// import React, { useState, useEffect } from "react";
// import HeaderBar from "./MainHeaderBar";
// import NotesMenu from "../notesMenu/NotesMenu";
// import EditorWorkspace from "./EditorWorkspace"; // NEW
// import HotkeyOverlay from "../modals/HotkeyOverlay";
// import SettingsModal from "../modals/SettingsModal";
// import "../../styles/themes.css";
// import "../../styles/styles.css";
// import "../../styles/math-node.css";
// import "../../styles/cells.css";
// import { DragProvider } from "../../hooks/DragProvider";
// import { EditorHistoryProvider } from "../../hooks/EditorHistoryProvider";

// const MainLayout: React.FC = () => {
//   const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
//   const [leftWidth, setLeftWidth] = useState(200);
//   const [rightWidth, setRightWidth] = useState(600);
//   const [showSettings, setShowSettings] = useState(false);
//   const [showHotkeys, setShowHotkeys] = useState(false);

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

//   return (
//     <div className="main-layout">
//       <HeaderBar
//         onOpenSettings={() => setShowSettings(true)}
//         onOpenHotkeys={() => setShowHotkeys(true)}
//       />

//       <div className="content" style={{ display: "flex", height: "calc(100vh - 50px)" }}>
//         <NotesMenu
//           width={leftWidth}
//           onWidthChange={setLeftWidth}
//           selectedNoteId={selectedNoteId}
//           onSelectNote={setSelectedNoteId}
//         />
//         <EditorHistoryProvider initialStates={initialEditorStates}>
//           <DragProvider>
//             <EditorWorkspace
//               noteId={selectedNoteId}
//               rightWidth={rightWidth}
//               setRightWidth={setRightWidth}
//             />
//           </DragProvider>
//         </EditorHistoryProvider>
//       </div>

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
// import type { EditorState } from "../../logic/editor-state";
import { createInitialCursor } from "../../logic/cursor";
import { createRootWrapper } from "../../models/nodeFactories";
import type { EditorSnapshot } from "../../logic/global-history";

// 🔧 TEMP: Replace this with actual loading logic later
// function loadEditorStatesForNote(noteId: string): Record<string, EditorState> {
//   const rootNode = createRootWrapper();

//   return {
//     [noteId]: {
//       rootNode,
//       cursor: createInitialCursor(rootNode),
//     },
//   };
// }
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
  };
}

// function loadNewEmptyNote(): EditorSnapshot {
//   return {
//     states: {},
//     order: [],
//   };
// }

const MainLayout: React.FC = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(600);
  const [showSettings, setShowSettings] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);
  // const [initialEditorStates, setInitialEditorStates] = useState<Record<string, EditorState> | null>(null);

  const [initialSnapshot, setInitialSnapshot] = useState<EditorSnapshot | null>(null);

  // === Settings state ===
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("mathEditorTheme") === "dark";
  });

  const [showColorInPreview, setShowColorInPreview] = useState(() => {
    return localStorage.getItem("showColorInPreview") === "true";
  });

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleShowColorInPreview = () => setShowColorInPreview(prev => !prev);

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
    localStorage.setItem("showColorInPreview", showColorInPreview ? "true" : "false");
  }, [showColorInPreview]);

  // === Load note when selected ===
  // useEffect(() => {
  //   if (selectedNoteId) {
  //     const loadedStates = loadEditorStatesForNote(selectedNoteId);
  //     setInitialEditorStates(loadedStates);
  //   } else {
  //     setInitialEditorStates(null);
  //   }
  // }, [selectedNoteId]);
  useEffect(() => {
    if (selectedNoteId) {
      const loadedSnapshot = loadEditorSnapshotForNote(selectedNoteId);
      setInitialSnapshot(loadedSnapshot);
    } else {
      setInitialSnapshot(null);
    }
  }, [selectedNoteId]);

  return (
    <div className="main-layout">
      <HeaderBar
        onOpenSettings={() => setShowSettings(true)}
        onOpenHotkeys={() => setShowHotkeys(true)}
      />

      <div className="content" style={{ display: "flex", height: "calc(100vh - 50px)" }}>
        <NotesMenu
          width={leftWidth}
          onWidthChange={setLeftWidth}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
        />
       {selectedNoteId && initialSnapshot ? (
          <EditorHistoryProvider initialSnapshot={initialSnapshot}>
            <DragProvider>
              <EditorWorkspace
                noteId={selectedNoteId}
                rightWidth={rightWidth}
                setRightWidth={setRightWidth}
              />
            </DragProvider>
          </EditorHistoryProvider>
        ) : (
          <div style={{ padding: "2rem", flexGrow: 1 }}>
            <h2>Select a note or create a new one</h2>
            <button className="button primary" onClick={() => setSelectedNoteId("note-4")}>
              Create Temporary Note
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
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
        />
      )}
    </div>
  );
};

export default MainLayout;
