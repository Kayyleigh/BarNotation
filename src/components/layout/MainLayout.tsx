// components/layout/MainLayout.tsx
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

  const getStoredBoolean = (key: string, fallback: boolean) => {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return stored === "true";
  };
  
  const getStoredNumber = (key: string, fallback: number) => {
    const raw = localStorage.getItem(key);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return isNaN(parsed) ? fallback : parsed;
  };

  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem("mathEditorTheme") !== "light" // dark is default
  );
  
  const [leftWidth, setLeftWidth] = useState(() => getStoredNumber("notesMenuWidth", 200));
  const [rightWidth, setRightWidth] = useState(() => getStoredNumber("mathLibraryWidth", 600));
  
  const [showColorInPreview, setShowColorInPreview] = useState(() =>
    getStoredBoolean("showColorInPreview", true)
  );
  
  const [nerdMode, setNerdMode] = useState(() =>
    getStoredBoolean("nerdMode", false)
  );
  
  const [authorName, setAuthorName] = useState(() =>
    localStorage.getItem("defaultAuthor") || ""
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);

  // Use lazy state initialization from localStorage
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length ? notes[0].id : null);

  const initialSnapshot: EditorSnapshot = selectedNoteId
  ? loadEditorSnapshotForNote(selectedNoteId)
  : createEmptySnapshot(); // Safe fallback

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const toggleShowColorInPreview = () => {
    console.log(`You want to toggle color setting`)
    setShowColorInPreview(prev => !prev);
  }

  const toggleNerdMode = () => {
    console.log(`Toggling nerd mode`)
    setNerdMode(prev => !prev);
  }

  // Save left width
  useEffect(() => {
    localStorage.setItem("notesMenuWidth", leftWidth.toString());
  }, [leftWidth]);
  
  // Save right width
  useEffect(() => {
    localStorage.setItem("mathLibraryWidth", rightWidth.toString());
  }, [rightWidth]);

  // Save theme preference
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  
    localStorage.setItem("mathEditorTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Save preview coloring preference
  useEffect(() => {
    document.body.classList.toggle("unColoredPreview", !showColorInPreview);
    localStorage.setItem("showColorInPreview", showColorInPreview ? "true" : "false");
  }, [showColorInPreview]);

  // Save nerd mode preference
  useEffect(() => {
    document.body.classList.toggle("nerdMode", nerdMode);
    localStorage.setItem("nerdMode", nerdMode ? "true" : "false");
  }, [nerdMode]);

  // Save notes to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Save default author name
  useEffect(() => {
    localStorage.setItem("defaultAuthor", authorName);
  }, [authorName]);

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
    console.warn(`I found ${original}`)

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
    const originalEditorState = localStorage.getItem(`note-editor-state-${original.id}`);
    if (originalEditorState) {
      console.warn(`I am going to set the state in storage`)
      localStorage.setItem(`note-editor-state-${newId}`, originalEditorState);
    }
    
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
                  // editorStates={editorStates}
                  // setEditorStates={setEditorStates}
                />
              </DragProvider>
            </EditorHistoryProvider>
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

