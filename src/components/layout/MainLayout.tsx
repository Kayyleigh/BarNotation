// components/layout/MainLayout.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import HeaderBar from "./MainHeaderBar";
import NotesMenu from "../notesMenu/NotesMenu";
import EditorWorkspace from "./EditorWorkspace";
import "../../styles/themes.css";
import "../../styles/styles.css";
import "../../styles/math-node.css";
import "../../styles/cells.css";
import { DragProvider } from "../../hooks/DragProvider";
import { EditorHistoryProvider } from "../../hooks/EditorHistoryProvider";
import { createInitialCursor } from "../../logic/cursor";
import { createRootWrapper } from "../../models/nodeFactories";
import { createEmptySnapshot, type EditorSnapshot } from "../../logic/global-history";
import type { CellData, Note, NoteMetadata } from "../../models/noteTypes";
import { useToast } from "../../hooks/useToast";

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

type MainLayoutProps = {
  onOpenSettings: () => void;
  onOpenHotkeys: () => void;
  authorName: string;
  setAuthorName: (value: string) => void;
  isDarkMode: boolean;
  showColorInPreview: boolean;
  nerdMode: boolean;
};

const MainLayout: React.FC<MainLayoutProps> = ({
  onOpenSettings,
  onOpenHotkeys,
  authorName,
  // setAuthorName,
  isDarkMode,
  showColorInPreview,
  nerdMode
}) => {
  const { showToast } = useToast();

  const getStoredNumber = (key: string, fallback: number) => {
    const raw = localStorage.getItem(key);
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return isNaN(parsed) ? fallback : parsed;
  };

  const [leftWidth, setLeftWidth] = useState(() => getStoredNumber("notesMenuWidth", 200));
  const [rightWidth, setRightWidth] = useState(() => getStoredNumber("mathLibraryWidth", 600));

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

  const initialSnapshot = useMemo(() => {
    return selectedNoteId
      ? loadEditorSnapshotForNote(selectedNoteId)
      : createEmptySnapshot();
  }, [selectedNoteId]);

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
  const selectedNote = useMemo(
    () => notes.find(note => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );

  const selectedNoteMetadata = useMemo(() => selectedNote?.metadata, [selectedNote]);
  const selectedNoteCells = useMemo(() => selectedNote?.cells, [selectedNote]);

  // Handler to update metadata (like title) of a note:
  const updateNoteMetadata = useCallback((noteId: string, newMetadata: Partial<NoteMetadata>) => {
    setNotes((prevNotes) =>
      prevNotes.map(note =>
        note.id === noteId ? { ...note, metadata: { ...note.metadata, ...newMetadata } } : note
      )
    );
  }, []);

  const handleUnarchiveNote = useCallback((id: string) => {
    let noteTitle = null;

    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (!note) return prev;
      noteTitle = note.metadata.title;

      return prev.map(n =>
        n.id === id
          ? { ...n, metadata: { ...n.metadata, archived: false, archivedAt: undefined } }
          : n
      );
    });

    if (noteTitle) {
      showToast({ type: "success", message: `Note "${noteTitle}" unarchived.` });
    }
  }, [showToast]);

  const handleDeleteNote = useCallback((id: string) => {
    let deletedNoteTitle: string | null = null;

    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (note) {
        deletedNoteTitle = note.metadata.title;
      }
      return prev.filter(note => note.id !== id);
    });

    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }

    // Do the toast after state update:
    if (deletedNoteTitle) {
      showToast({ type: "success", message: `Note "${deletedNoteTitle}" deleted.` });
    } else {
      showToast({ type: "success", message: `Note deleted.` });
    }
  }, [selectedNoteId, showToast]);

  const updateNoteCells = useCallback((noteId: string, newCells: CellData[]) => {
    setNotes((prevNotes) =>
      prevNotes.map(note => {
        if (note.id !== noteId) return note;

        // Avoid updating unless something actually changed
        if (note.cells === newCells) return note;
        if (
          note.cells.length === newCells.length &&
          note.cells.every((cell, idx) => cell === newCells[idx])
        ) {
          return note;
        }

        return { ...note, cells: newCells };
      })
    );
  }, []);


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

  const archiveNote = useCallback((id: string) => {
    let noteTitle: string | null = null;

    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (!note || note.metadata.archived) return prev;
      noteTitle = note.metadata.title;

      const updated = prev.map(n =>
        n.id === id
          ? { ...n, metadata: { ...n.metadata, archived: true, archivedAt: Date.now() } }
          : n
      );

      if (selectedNoteId === id) {
        const nextNote = updated.find(n => !n.metadata.archived && n.id !== id);
        setSelectedNoteId(nextNote?.id ?? null);
      }

      return updated;
    });

    if (noteTitle) {
      showToast({ type: "success", message: `Note "${noteTitle}" archived.` });
    }
  }, [selectedNoteId, showToast]);


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
      cells: [
        ...original.cells,
      ]
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
    showToast({ message: `LaTeX export is not yet implemented`, type: "warning" });
  };

  return (
    <div className="main-layout">
      <HeaderBar
        onOpenSettings={onOpenSettings}
        onOpenHotkeys={onOpenHotkeys}
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
            onDeleteNote={handleDeleteNote}
            onArchiveNote={archiveNote}
            onUnarchiveNote={handleUnarchiveNote}
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
                noteMetadata={selectedNoteMetadata}
                setNoteMetadata={updateNoteMetadata}
                noteCells={selectedNoteCells}
                setNoteCells={updateNoteCells}
              // editorStates={editorStates}
              // setEditorStates={setEditorStates}
              />
            </DragProvider>
          </EditorHistoryProvider>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MainLayout);

