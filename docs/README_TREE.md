<style>
details {
  margin-left: 2em;
}
summary {
  margin-left: -2em;
}
</style>

<details>
  <summary><code>src/</code> — </summary>

●	`App.tsx` — Main entry point wrapper (renders main component)
●	`index.css` — Tailwind import (likely unused)
●	`main.tsx` — Bootstraps App inside React.StrictMode
●	`vite-env.d.ts` — Vite environment type declarations
<details>
  <summary><code>assets/</code> — Static assets</summary>

●	`logo.svg` — Full logo SVG (used in header)

</details>
<details>
  <summary><code>components/</code> — React components grouped by function</summary>

<details>
  <summary><code>common/</code> — </summary>

●	`SearchBar.module.css` — 
●	`SearchBar.tsx` — 
●	`SortDropdown.module.css` — 
●	`SortDropdown.tsx` — 
●	`toast.module.css` — 
●	`ToastProvider.tsx` — 
●	`ToastRenderer.tsx` — 

</details>
<details>
  <summary><code>editor/</code> — Editor and Notation-related components</summary>

●	`CellRow.tsx` — 
●	`Editor.module.css` — Styling for EditorPane/NotationEditor
●	`EditorHeaderBar.module.css` — 
●	`EditorHeaderBar.tsx` — EditorPane header (controls, zoom, add cell)
●	`EditorPane.tsx` — Manages cells and header/editor coordination
●	`NotationEditor.tsx` — Renders single Notebook's cell list
●	`NoteMetadataSection.module.css` — CSS for note metadata section
●	`NoteMetadataSection.tsx` — Note metadata (title, author, date)
<details>
  <summary><code>cells/</code> — </summary>

●	`BaseCell.tsx` — 
●	`cell.module.css` — 
●	`InsertCellButtons.tsx` — 
●	`MathCell.tsx` — 
●	`TextCell.tsx` — 

</details>

</details>
<details>
  <summary><code>icons/</code> — UI icon components</summary>

●	`CollapseIcon.tsx` — Collapse arrow icon

</details>
<details>
  <summary><code>layout/</code> — Layout and layout-related components</summary>

●	`EditorWorkspace.module.css` — CSS for workspace styling
●	`EditorWorkspace.tsx` — Wrapper for EditorPane & MathLibrary
●	`MainHeaderBar.tsx` — Outdated header bar (logo, settings)
●	`MainLayout.tsx` — Overall app layout structure
●	`ModalsLayer.tsx` — 
●	`ResizableSidebar.module.css` — CSS for resizable sidebar
●	`ResizableSidebar.tsx` — Resizable sidebar component

</details>
<details>
  <summary><code>mathExpression/</code> — Math expression rendering/editing</summary>

●	`DummyStartNodeRenderer.tsx` — Dummy start node for drag/drop
●	`LatexViewer.module.css` — CSS for LaTeX viewer
●	`LatexViewer.tsx` — Displays LaTeX of a math expression
●	`MathEditor.module.css` — 
●	`MathEditor.tsx` — Math expression editor
●	`MathRenderer.tsx` — Recursive expression renderer with drag
●	`MathRenderers.tsx` — Renderers for individual MathNode types
●	`MathView.tsx` — Non-interactive math viewer (used in Library)

</details>
<details>
  <summary><code>mathLibrary/</code> — Math Library components</summary>

●	`CollectionTabs.tsx` — 
●	`LibraryEntries.tsx` — 
●	`MathLibrary.module.css` — CSS for library panel
●	`MathLibrary.tsx` — Math node library panel
●	`TabDropdownPortal.module.css` — CSS for library dropdown
●	`TabDropdownPortal.tsx` — Library dropdown (rename, archive, delete)

</details>
<details>
  <summary><code>modals/</code> — Modal components</summary>

●	`ArchiveModal.module.css` — 
●	`ArchiveModal.tsx` — 
●	`HotkeyOverlay.module.css` — 
●	`HotkeyOverlay.tsx` — Hotkey info overlay
●	`LibCollectionArchiveModal.module.css` — 
●	`LibCollectionArchiveModal.tsx` — 
●	`Modal.module.css` — 
●	`Modal.tsx` — 
●	`NotebookArchiveModal.module.css` — 
●	`NotebookArchiveModal.tsx` — 
●	`SettingsModal.module.css` — 
●	`SettingsModal.tsx` — Settings/preferences modal (e.g., theme)

</details>
<details>
  <summary><code>notesMenu/</code> — Note switching/opening menu</summary>

●	`NoteActionsDropdown.module.css` — 
●	`NoteActionsDropdown.tsx` — 
●	`NoteListItem.tsx` — 
●	`NotesMenu.module.css` — 
●	`NotesMenu.tsx` — Menu to switch or open notes

</details>
<details>
  <summary><code>tooltips/</code> — Tooltip UI components</summary>

●	`tooltip.css` — CSS for tooltips
●	`Tooltip.tsx` — Tooltip wrapper for hover text

</details>
<details>
  <summary><code>zOutdated/</code> — </summary>

●	`HeaderBar.tsx` — 
●	`MathCell.tsx` — 
●	`MathNotationTool.tsx` — 
●	`TextCell.tsx` — 
●	`Toolbar.tsx` — 

</details>

</details>
<details>
  <summary><code>constants/</code> — </summary>

●	`premadeMathCollections.ts` — 

</details>
<details>
  <summary><code>hooks/</code> — React hooks for state and interaction</summary>

●	`DragContext.ts` — Global drag context
●	`DragProvider.tsx` — 
●	`EditorHistoryContext.tsx` — Context for editor history
●	`EditorHistoryProvider.tsx` — Provider for history context
●	`EditorModeContext.ts` — 
●	`EditorModeProvider.tsx` — 
●	`HoverContext.ts` — 
●	`HoverProvider.tsx` — 
●	`toastContext.ts` — 
●	`useCellDragState.ts` — Hook for dragging cells (in notebook)
●	`useDragContext.ts` — 
●	`useDragState.ts` — Hook for dragging MathNodes (OUTDATED)
●	`useEditorHistory.ts` — Hook for editor history (OUTDATED)
●	`useEditorMode.ts` — 
●	`useHover.ts` — 
●	`useHoverState.ts` — Hover state for MathNodes
●	`useToast.ts` — 
●	`useZoom.ts` — Zoom control hook for MathEditor

</details>
<details>
  <summary><code>logic/</code> — Core MathEditor logic (cursor, input, history)</summary>

●	`cursor.ts` — CursorPosition: container + index
●	`deletion.ts` — Backspace handler
●	`editor-state.ts` — Editor state type (rootNode, cursor)
●	`global-history.ts` — Global cell history (id-order mapping)
●	`handle-keydown.ts` — MathEditor keydown handler
●	`history.ts` — HistoryState (OUTDATED format)
●	`insertion.ts` — Character insertion logic
●	`navigation.ts` — Arrow key navigation in MathEditor
●	`node-manipulation.ts` — MathNode insert/delete logic
●	`transformations.ts` — MathNode transformations (e.g. wrap in fraction)

</details>
<details>
  <summary><code>models/</code> — Types and models for nodes, notes, etc.</summary>

●	`latexParser.ts` — Parses LaTeX into MathNode tree
●	`libraryTypes.ts` — LibraryEntry interface (metadata, LaTeX, etc.)
●	`nodeFactories.ts` — Factories for MathNode types
●	`nodeToLatex.ts` — Converts MathNode to LaTeX string
●	`noteTypes.ts` — Types for CellData, NoteMetadata, Note
●	`specialSequences.ts` — Escape → MathNode mappings
●	`textTypes.ts` — 
●	`transformations.ts` — Helper transforms (WIP/boilerplate)
●	`types.ts` — Full MathNode type definition

</details>
<details>
  <summary><code>styles/</code> — Global CSS styles</summary>

●	`accents.css` — CSS for accented math nodes
●	`cells.css` — Styles for cells and insert zones
●	`hotkeyOverlay.css` — CSS for hotkey overlay & settings modal
●	`latexOutputColoring.css` — LaTeX viewer syntax coloring
●	`math-node-old.css` — 
●	`math-node.css` — Styling for MathNode components
●	`math.css` — Outdated math styles
●	`settings.css` — Settings toggles styling
●	`styles.css` — Base UI styles: headers, overlays, containers
●	`textStyles.module.css` — 
●	`themes.css` — Root theme styles (dark/light, scrollbars)

</details>
<details>
  <summary><code>utils/</code> — Utility functions for MathNode operations</summary>

●	`accentUtils.ts` — Maps decorations to LaTeX packages
●	`bracketUtils.ts` — Bracket style definitions
●	`collectionUtils.ts` — Init functions for library collections
●	`dateUtils.ts` — 
●	`mathHoverUtils.ts` — MathNode hover event handlers
●	`navigationUtils.ts` — Cursor movement helpers
●	`noop.ts` — `noop` function: `() => {}`
●	`noteUtils.tsx` — 
●	`stringUtils.ts` — 
●	`subsupUtils.ts` — CornerPosition helper (used in transforms)
●	`textContainerUtils.ts` — Unused: split MultiDigit nodes
●	`treeUtils.ts` — Tree manipulation for MathNodes

</details>

</details>