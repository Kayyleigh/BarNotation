// English

const en = {
  searchbar: { // Generic search bar 
    placeholder: "Search...",
    tooltip: "Search",
    clear: "Clear search",
  },

  sortDropdown: { // Generic sort dropdown 
    sortedBy: "Sorted by",
  },

  customCommandIconTooltip: "Has custom command", //NEW +//TODO maybe move this into some sub thing

  cellRow: {
    math: "Math",
    text: "Text",
    hideLatex: "Hide LaTeX output",
    showLatex: "Show LaTeX output",
    latex: "LaTeX",
    loading: "Loading cell...", // text shown while cell content is loading

    // text types (keys matching TEXT_CELL_TYPES), used to indicate type of text cell
    section: "Section",
    subsection: "Subsection",
    subsubsection: "Subsubsection",
    plain: "Plain",
  },

  editor: {
    addMath: "Add math cell",
    addText: "Add text cell",
    lockedAdd: "Cannot add cells in locked mode",
    cleanup: "Remove empty cells", //UNUSED, I REMOVED THE CLEANUP FEATURE
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
    cannotDoInLocked: "Cannot edit in locked mode", //NEW
    math: "Math",
    text: "Text",
    emptyMessage: "No cells yet. Add one to get started!",
    lockedTooltip: "You are in locked mode. Unlock to continue editing.",
    metadata: {
      untitled: "Untitled Note",
      author: "Author",
      date: "Date or Period",
      nodate: "No Date", //NEW
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

  latex: {
    refreshPrompt: "⟲ Refresh LaTeX*",
    freshPrompt: "✓ Refreshed LaTeX",
    lastRefreshed: "Last refreshed",
    refreshing: "Refreshing...",
    error: "⚠ Error generating LaTeX",
    copy: "📋 Copy",
    copied: "✔ Copied",
    never: "Never"
  },

  modals: {
    close: "Close",
    save: "save", //NEW
    cancel: "cancel", //NEW
    archiveModal: {
      noItemsFound: "No items found.",
      searchPlaceholder: "Search..."
    },
    hotkeysModal: {
      title: "Keyboard Shortcuts",
      inputShortcuts: "Input Shortcuts",

      // Childed/Actuarial
      subscript: "Make subscript",
      superscript: "Make superscript (exponent)",
      actuarialBL: "Make actuarial (bottom-left focus)",
      actuarialTL: "Make actuarial (top-left focus)",
      actuarialBR: "Make actuarial (bottom-right focus)",
      actuarialTR: "Make actuarial (top-right focus)",

      // Overset/Underset
      underset: "Make underset",
      overset: "Make overset",

      // Actuarial precedence
      nthbottom: "Add precedence below (Actuarial)", //TODO NEW; ADD TO OTHER LANGUAGES 
      nthtop: "Add precedence above (Actuarial)", //TODO NEW; ADD TO OTHER LANGUAGES 

      // Matrix
      insertMatrixRowBelow: "(Inside matrix) Insert row below", //TODO NEW; ADD TO OTHER LANGUAGES 
      insertMatrixRowAbove: "(Inside matrix) Insert row above", //TODO NEW; ADD TO OTHER LANGUAGES 
      insertMatrixColumnLeft: "(Inside matrix) Insert column left", //TODO NEW; ADD TO OTHER LANGUAGES 
      insertMatrixColumnRight: "(Inside matrix) Insert column right", //TODO NEW; ADD TO OTHER LANGUAGES 

      fraction: "Turn node into numerator of new fraction",
      command: "Insert command node", //NEW

      structuralShortcuts: "Structural Shortcuts",
      rearrangeNodes: "Rearrange nodes",
      editingAndNavigation: "Editing & Navigation",
      navigate: "Navigate between nodes",
      delete: "Delete node",
      copy: "Copy as LaTeX",
      cut: "Cut as LaTeX",
      paste: "Paste LaTeX",
      undo: "Undo",
      redo: "Redo",
      viewControls: "View Controls",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      zoomReset: "Reset zoom",
    },
    collectionArchive: {
      title: "Archived Collections",
      searchPlaceholder: "Search archived collections...",
      searchTooltip: "Search by collection name",
      noMatching: "No matching collections.",
      noEntries: "No entries.",
      entry: "entry",
      entries: "entries",
      preview: "Preview",
      hide: "Hide",
      restore: "Restore",
      restoreTooltip: "Restore collection",
      deleteTooltip: "Permanently delete collection",
      deleteConfirm: "Delete permanently",
      archivedAt: "Archived at",
      createdAt: "Created at",
      tooltip: {
        noEntries: "No entries to show",
        hide: "Hide preview",
        view: "View collection entries",
      },
      sort: {
        archived_desc: "Recently Archived",
        archived_asc: "Longest Archived",
        created_desc: "Newest Collection",
        created_asc: "Oldest Collection",
        name_desc: "Name A → Z",
        name_asc: "Name Z → A",
        entryCount_desc: "Most Entries",
        entryCount_asc: "Fewest Entries",
      },
    },
    notebookArchive: {
      title: "Archived Notebooks",
      searchPlaceholder: "Search archived notebooks...",
      searchTooltip: "Search by title, course code, or author name",
      noMatches: "No matching notebooks.",
      restore: "Restore",
      restoreTooltip: "Restore notebook",
      deleteTooltip: "Permanently delete",
      confirmDelete: `Delete "{{title}}" permanently?`,
      archivedAt: "Archived at {{date}}",
      createdAt: "Created at {{date}}",
      by: "By",
      cell: "cell",
      cell_plural: "cells",
      sort: {
        recentlyArchived: "Recently Archived",
        longestArchived: "Longest Archived",
        newestCreated: "Newest Created",
        oldestCreated: "Oldest Created",
        recentlyModified: "Recently Modified", //NEW; ADD IN OTHERS
        leastRecentlyModified: "Least Recently Modified", //NEW; ADD IN OTHERS
        mostCells: "Most Cells",
        leastCells: "Least Cells",
        titleAZ: "Title A → Z",
        titleZA: "Title Z → A",
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
    exportLatex: {
      title: "Export LaTeX",
      formatLabel: "Format",
      format: {
        single: "Single column",
        double: "Double column",
      },
      wrapEquations: "Wrap math in equation environments",
      download: "Download",
      downloadTooltip: "Download .tex file",
    },
    editCommand: { //ALL NEW
      title: "Edit Custom Command",
      label: "Command",
      placeholder: "Type command",
      statusLabel: {
        valid: "Valid sequence.",
        invalid: "Invalid",
        willClear: "Will remove command.",
        alreadyExists: "Sequence already in use.",
        reserved: "Sequence reserved.",
        tooLong: "Sequence too long.",
        unchanged: "No changes.",
        empty: "Nothing to save.",
        containsSpaces: "No spaces allowed.",
      },
      charLimitTooltip: "Max length for display reasons.",
    },
  },

  notesMenu: {
    createTooltip: "Create new notebook",
    newNote: "New Note",
    archiveTooltip: "View archived notebooks",
    archived: "Archived",
    searchPlaceholder: "Search notes...",
    searchTooltip: "Search notes by title",
    notesSection: "Notes",
    sort: {
      modified: "Last Modified",
      created: "Creation Date",
      title: "Title A → Z",
      cellCount: "Cell Count",
    },
    noNotes: "No notes found.",
    noteOptions: "Note options",
    actions: {
      archive: "Archive",
      duplicate: "Duplicate",
      exportLatex: "Export to LaTeX",
      delete: "Delete",
    }
  },

  mathLibrary: {
    entries: {
      deleteEntry: "Delete entry",
      empty: "Drag math expression here",
      noMatches: "No matches found",
      ariaLabel: "Entries in collection {{name}}",
      toast: {
        added: "Added entry.", //NEW
        commandSaved: "Saved custom command.", //NEW
        commandClearned: "Removed custom command.", //NEW
      }
    },
    error: {
      loadStorage: "Failed to load library collections from storage.",
      saveStorage: "Failed to save library collections.",
      parseLatex: "Failed to parse LaTeX.",
    },
    success: {
      addLatex: "LaTeX added to library.",
      entryMoved: "Entry moved between collections.",
      entryAddedTo: `Entry {{latex}} added to {{collection}}.`,
      unarchived: `Unarchived collection.`,
      deleted: `Deleted "{{name}}"`,
    },
    warning: {
      entryExists: "Entry already exists in collection.",
      entryExistsIn: `Entry {{latex}} already exists in {{collection}}.`,
    },
    search: {
      placeholder: "Search Collection...",
      placeholderWith: "Search {{name}}...",
      tooltip: "Search on LaTeX or custom command substring", //CHANGED 
    },
    sort: {
      newest: "Newest",
      oldest: "Oldest",
      mostUsed: "Most Used", //OUTDATED
      leastUsed: "Least Used", //OUTDATED
      mostUsedLocal: "Most Used Here", //NEW
      leastUsedLocal: "Least Used Here", //NEW
      mostUsedGlobal: "Most Used App-Wide", //NEW
      leastUsedGlobal: "Least Used App-Wide", //NEW
      aZ: "A → Z",
      zA: "Z → A",
      ariaLabel: "Sort library entries",
    },
    loading: "Loading collections, this may take a while...",
    empty: "No active collection available.",
    default: {
      collection: "Collection",
    },
    tabs: {
      defaultName: "My Collection",
      tooltip: {
        new: "New Collection",
        archive: "View archived collections", //CHANGED
        moreOptions: "More options",
      },
      toast: {
        duplicated: `Duplicated "{{name}}".`,
        deleted: `Deleted "{{name}}".`,
        archived: `Archived "{{name}}".`,
        renamed: `Renamed "{{oldName}}" to "{{newName}}".`, //NEW
        failed: `Unknown failure.`, //NEW
        copiedToColl: `Copied {{entry}} to {{collection}}.`, //NEW
        cannotRenamePremade: `Cannot rename a pre-defined collection.`, //NEW
        cannotDeletePremade: `Cannot delete a pre-defined collection.`, //NEW
        unsupportedDrop: `Unsupported action.`, //NEW

      },
      confirm: {
        delete: "Are you sure you want to delete this collection?",
      },
    },
    tabMenu: { // Dropdown actions (and corresponding tooltip texts) for library tabs
      rename: "Rename",
      renameTooltip: "Rename collection",
      duplicate: "Duplicate",
      duplicateTooltip: "Duplicate collection",
      archive: "Archive",
      archiveTooltip: "Move to archive",
      delete: "Delete",
      deleteTooltip: "Delete permanently",
    },
  },
  date: { // Formatting creation/edit times, used in notes menu and in the archives
    created: "Created",
    edited: "Edited",
    archived: "Archived",
    justNow: "just now",
    minuteAgo: "{{count}} minute ago",
    minuteAgo_plural: "{{count}} minutes ago",
    hourAgo: "{{count}} hour ago",
    hourAgo_plural: "{{count}} hours ago",
    yesterday: "yesterday",
  },

  premadeCollections: { // Names of premade library collections, used in the collection tabs in the Math Library
    "premade-structures": "🏗️ Structures",
    "premade-calculus": "Calculus",
    "premade-logic": "Logic",
    "premade-probability": "Probability & Statistics",
    "greek-and-hebrew": "Greek & Hebrew", //CHANGED
    "premade-actuarial": "Actuarial Science",
    "premade-linalg": "Linear Algebra", //TODO NEW; ADD TO OTHER LANGUAGES 
  }
};

export default en;
