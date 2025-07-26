const en = {
  searchbar: {
    placeholder: "Search...",
    tooltip: "Search",
    clear: "Clear search",
  },

  cellRow: {
    math: "Math",
    text: "Text",
    hideLatex: "Hide LaTeX output",
    showLatex: "Show LaTeX output",
    latex: "LaTeX",
    loading: "Loading cell...",
    // text types (match keys from TEXT_CELL_TYPES)
    section: "Section",
    subsection: "Subsection",
    subsubsection: "Subsubsection",
    plain: "Plain",
  },

  editor: {
    addMath: "Add math cell",
    addText: "Add text cell",
    lockedAdd: "Cannot add cells in locked mode",
    cleanup: "Remove empty cells",
    cleanupWip: "Cleanup is not yet implemented",
    clean: "Clean",
    showLatex: "Show all LaTeX",
    hideLatex: "Hide all LaTeX",
    enterPreview: "Enter preview mode",
    returnEdit: "Return to edit mode",
    preview: "Preview",
    edit: "Edit",
    lock: "Lock",
    unlock: "Unlock",
    resetZoom: "Reset all zoom levels",
    changeZoom: "Change default zoom level",
    defaultZoom: "Default Zoom",
    math: "Math",
    text: "Text",
    emptyMessage: "No cells yet. Add one to get started!",
    lockedTooltip: "You are in locked mode. Unlock to continue editing.",
    metadata: {
      untitled: "Untitled Note",
      author: "Author",
      date: "Date or Period",
      course: "Course Code"
    },
    cell: {
      drag: "Drag to re-order cells",
      duplicate: "Duplicate cell",
      duplicateBtn: "Duplicate",
      delete: "Delete cell"
    },
  },

  layout: {
    mathLibraryPanel: "Math Library",
    notesMenuPanel: "Notes",
    notesMenu: {
      newNoteTitle: "My New Note",
      noteUnarchived: 'Note "{{title}}" unarchived.',
      noteDeleted: 'Note "{{title}}" deleted.',
      noteArchived: 'Note "{{title}}" archived.',
    }, 
    sidebar: {
      show: "Show {{title}}",
      hide: "Hide {{title}}",
      expand: "Expand {{title}}",
      collapse: "Collapse {{title}}",
    },
    header: {
      hotkeys: {
        label: "Hotkeys",
        tooltip: "Show hotkey overview",
      },
      userGuide: {
        label: "User Guide",
        tooltip: "Open user guide",
        toast: "User guide is not yet written",
      },
      settings: {
        label: "Settings",
        tooltip: "Change your settings",
      },
    },
  }, 

  settings: {
    title: "Settings",
    theme: "Theme",
    themeTooltip: "Toggle theme",
    light: "Light Mode",
    dark: "Dark Mode",
    showColor: "Show color in preview",
    showColorTooltip: "Toggle color use in preview mode",
    defaultAuthor: "Default Author Name",
    authorPlaceholder: "Your name",
    nerdMode: "I am a nerd",
    nerdTooltip: "Toggle visibility of node drag frequencies",
    language: "Language",
  },
};

export default en;
