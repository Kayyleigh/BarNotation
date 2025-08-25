// components/layout/MainLayout.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import HeaderBar from "./MainHeaderBar";
import NotesMenu from "../notesMenu/NotesMenu";
import EditorWorkspace from "./EditorWorkspace";
import "../../styles/themes.css";
import "../../styles/styles.css";
import "../../styles/math-node.css";
import "../../styles/cells.css";
import { DragProvider } from "../../hooks/mathDrag/DragProvider";
import { EditorHistoryProvider } from "../../hooks/editorHistory/EditorHistoryProvider";
import { createInitialCursor } from "../../logic/cursor";
import { createRootWrapper } from "../../models/nodeFactories";
import { createEmptySnapshot, type EditorSnapshot } from "../../logic/global-history";
import type { CellData, Note, NoteMetadata } from "../../models/noteTypes";
import { useToast } from "../../hooks/toast/useToast";
import ResizableSidebar from "./ResizableSidebar";
import { ResizableProvider } from "../../hooks/resizablePanels/ResizableProvider";
import { useI18n } from "../../i18n/useI18n";
import ExportLatexModal from "../modals/ExportLatexModal";

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
const SELECTED_NOTE_KEY = "selectedNoteId";

type MainLayoutProps = {
  onOpenSettings: () => void;
  onOpenHotkeys: () => void;
  authorName: string;
  setAuthorName: (value: string) => void;
  theme: string;
  showColorInPreview: boolean;
  nerdMode: boolean;
  // onOpenNotesArchive: () => void;
};

const MainLayout: React.FC<MainLayoutProps> = ({
  onOpenSettings,
  onOpenHotkeys,
  authorName,
  // setAuthorName,
  theme,
  showColorInPreview,
  nerdMode,
}) => {
  const { t } = useI18n(); // use language hook

  const { showToast } = useToast();

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

  const [selectedNoteId, setSelectedNoteIdState] = useState<string | null>(() => {
    const storedId = localStorage.getItem(SELECTED_NOTE_KEY);
    return storedId ?? (notes.length ? notes[0].id : null);
  });

  const [latexExportNoteId, setLatexExportNoteId] = useState<string | null>(null);

  const setSelectedNoteId = useCallback((id: string | null) => {
    setSelectedNoteIdState(id);
    if (id) {
      localStorage.setItem(SELECTED_NOTE_KEY, id);
    } else {
      localStorage.removeItem(SELECTED_NOTE_KEY);
    }
  }, []);

  const initialSnapshot = useMemo(() => {
    const noteExists = notes.some(note => note.id === selectedNoteId);
    return noteExists && selectedNoteId
      ? loadEditorSnapshotForNote(selectedNoteId)
      : createEmptySnapshot();
  }, [selectedNoteId, notes]);

  // Save theme preference
  useEffect(() => {
    const root = document.documentElement;
    root.className = ""; // clear all theme classes
    if (theme !== "light") {
      root.classList.add(theme);
    }
  
    localStorage.setItem("mathEditorTheme", theme);
  }, [theme]);

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

  useEffect(() => {
    if (selectedNoteId && !notes.some(note => note.id === selectedNoteId)) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId, notes, setSelectedNoteId]);

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

  const menuNotes = useMemo(() => {
    return notes
      .filter(n => !n.metadata.archived)
      .map(note => ({
        id: note.id,
        title: note.metadata.title,
        cellCount: note.cells.length,
        archived: note.metadata.archived,
        createdAt: note.metadata.createdAt,
        updatedAt: note.metadata.updatedAt,
      }));
  }, [notes]);


  const prevArchivedIdsRef = React.useRef(new Set<string>());
  const prevNotesRef = React.useRef<Note[]>([]);

  const archivedNotes = React.useMemo(() => {
    if (
      !prevNotesRef.current.length ||
      notes.length !== prevNotesRef.current.length ||
      notes.some((note, i) => {
        const prevNote = prevNotesRef.current[i];
        return (
          !prevNote ||
          prevNote.id !== note.id ||
          prevNote.metadata.archived !== note.metadata.archived
        );
      })
    ) {
      prevNotesRef.current = notes;
      const archived = notes.filter(note => note.metadata.archived);
      prevArchivedIdsRef.current = new Set(archived.map(n => n.id));
      return archived;
    }
    // no change, return previous filtered array
    return notes.filter(note => prevArchivedIdsRef.current.has(note.id));
  }, [notes]);

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
      showToast({ type: "success", message: t("layout.notesMenu.noteUnarchived", { title: noteTitle }) });
    }
  }, [showToast, t]);

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
      showToast({ type: "success", message: t("layout.notesMenu.noteDeleted", { title: deletedNoteTitle }) });
    } else {
      showToast({ type: "success", message: `Note deleted.` });
    }
  }, [selectedNoteId, setSelectedNoteId, showToast, t]);

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


  const createNewNote = useCallback(() => {
    const newId = `note-${Date.now()}`;
    const newNote: Note = {
      id: newId,
      metadata: {
        title: t("layout.notesMenu.newNoteTitle"), // "My New Note"
        author: authorName,
        dateOrPeriod: "",
        archived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      cells: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newId);
  }, [authorName, setSelectedNoteId, t]);

  // Note archiving logic
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
      showToast({ type: "success", message: t("layout.notesMenu.noteArchived", { title: noteTitle }) });
    }
  }, [selectedNoteId, setSelectedNoteId, showToast, t]);

  // Note duplication logic
  const duplicateNote = useCallback((id: string) => {
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
        updatedAt: Date.now(),
      },
      cells: [
        ...original.cells,
      ]
    };
    const originalEditorState = localStorage.getItem(`note-editor-state-${original.id}`);
    if (originalEditorState) {
      localStorage.setItem(`note-editor-state-${newId}`, originalEditorState);
    }

    setNotes(prevNotes => {
      const newNoteList = [duplicatedNote, ...prevNotes];
      setTimeout(() => setSelectedNoteId(newId), 0); // next tick
      return newNoteList;
    });
  }, [notes, setSelectedNoteId]);

  const exportLatex = useCallback((id: string) => {
    setLatexExportNoteId(id);
  }, []);

  return (
    <div className="main-layout">
      <HeaderBar
        onOpenSettings={onOpenSettings}
        onOpenHotkeys={onOpenHotkeys}
      />
      <ResizableProvider>
        <div style={{ display: "flex", height: "calc(100vh - 50px)", width: "100%" }}> {/* TODO no height hardcoding of menu bar */}
          <ResizableSidebar
            side="left"
            title={t("layout.notesMenuPanel")}
          >
            <NotesMenu
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
              noteSummaries={menuNotes}
              onCreateNote={createNewNote}
              onDeleteNote={handleDeleteNote}
              onArchiveNote={archiveNote}
              onUnarchiveNote={handleUnarchiveNote}
              onDuplicateNote={duplicateNote}
              onExportLatex={exportLatex}
              archivedNotes={archivedNotes}
            />
          </ResizableSidebar>
          <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
            {/* {selectedNoteId && selectedNote && initialSnapshot ? ( */}
            <EditorHistoryProvider initialSnapshot={initialSnapshot}>
              <DragProvider>
                <EditorWorkspace
                  noteId={selectedNoteId}
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
      </ResizableProvider>
      {latexExportNoteId && (
        <ExportLatexModal
          note={notes.find(n => n.id === latexExportNoteId)!}
          onClose={() => setLatexExportNoteId(null)}
        />
      )}
    </div>
  );
};

export default React.memo(MainLayout);

