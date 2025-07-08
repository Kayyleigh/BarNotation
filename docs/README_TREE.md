<style>
details {
  margin-left: 2em;
}
summary {
  margin-left: -2em;
}
</style>

<details>
  <summary><code>src/</code> — Click to see the full source folder<br></summary>

●	`App.tsx` — Main entry point wrapper (renders main component)<br>●	`index.css` — Tailwind import (likely unused)<br>●	`main.tsx` — Bootstraps App inside React.StrictMode<br>●	`vite-env.d.ts` — Vite environment type declarations<br><details>
  <summary><code>assets/</code> — Static assets<br></summary>

●	`logo.svg` — Full logo SVG (used in header)<br>

</details><details>
  <summary><code>components/</code> — React components grouped by function<br></summary>

<details>
  <summary><code>common/</code> — <br></summary>

●	`SearchBar.module.css` — <br>●	`SearchBar.tsx` — <br>●	`SortDropdown.module.css` — <br>●	`SortDropdown.tsx` — <br>●	`toast.module.css` — <br>●	`ToastProvider.tsx` — <br>●	`ToastRenderer.tsx` — <br>

</details><details>
  <summary><code>editor/</code> — Editor and Notation-related components<br></summary>

●	`CellRow.tsx` — <br>●	`Editor.module.css` — Styling for EditorPane/NotationEditor<br>●	`EditorHeaderBar.module.css` — <br>●	`EditorHeaderBar.tsx` — EditorPane header (controls, zoom, add cell)<br>●	`EditorPane.tsx` — Manages cells and header/editor coordination<br>●	`NotationEditor.tsx` — Renders single Notebook's cell list<br>●	`NoteMetadataSection.module.css` — CSS for note metadata section<br>●	`NoteMetadataSection.tsx` — Note metadata (title, author, date)<br><details>
  <summary><code>cells/</code> — <br></summary>

●	`BaseCell.tsx` — <br>●	`cell.module.css` — <br>●	`InsertCellButtons.tsx` — <br>●	`MathCell.tsx` — <br>●	`TextCell.tsx` — <br>

</details>

</details><details>
  <summary><code>icons/</code> — UI icon components<br></summary>

●	`CollapseIcon.tsx` — Collapse arrow icon<br>

</details><details>
  <summary><code>layout/</code> — Layout and layout-related components<br></summary>

●	`EditorWorkspace.module.css` — CSS for workspace styling<br>●	`EditorWorkspace.tsx` — Wrapper for EditorPane & MathLibrary<br>●	`MainHeaderBar.tsx` — Outdated header bar (logo, settings)<br>●	`MainLayout.tsx` — Overall app layout structure<br>●	`ModalsLayer.tsx` — <br>●	`ResizableSidebar.module.css` — CSS for resizable sidebar<br>●	`ResizableSidebar.tsx` — Resizable sidebar component<br>

</details><details>
  <summary><code>mathExpression/</code> — Math expression rendering/editing<br></summary>

●	`DummyStartNodeRenderer.tsx` — Dummy start node for drag/drop<br>●	`LatexViewer.module.css` — CSS for LaTeX viewer<br>●	`LatexViewer.tsx` — Displays LaTeX of a math expression<br>●	`MathEditor.module.css` — <br>●	`MathEditor.tsx` — Math expression editor<br>●	`MathRenderer.tsx` — Recursive expression renderer with drag<br>●	`MathRenderers.tsx` — Renderers for individual MathNode types<br>●	`MathView.tsx` — Non-interactive math viewer (used in Library)<br>

</details><details>
  <summary><code>mathLibrary/</code> — Math Library components<br></summary>

●	`CollectionTabs.tsx` — <br>●	`LibraryEntries.tsx` — <br>●	`MathLibrary.module.css` — CSS for library panel<br>●	`MathLibrary.tsx` — Math node library panel<br>●	`TabDropdownPortal.module.css` — CSS for library dropdown<br>●	`TabDropdownPortal.tsx` — Library dropdown (rename, archive, delete)<br>

</details><details>
  <summary><code>modals/</code> — Modal components<br></summary>

●	`ArchiveModal.module.css` — <br>●	`ArchiveModal.tsx` — <br>●	`HotkeyOverlay.module.css` — <br>●	`HotkeyOverlay.tsx` — Hotkey info overlay<br>●	`LibCollectionArchiveModal.module.css` — <br>●	`LibCollectionArchiveModal.tsx` — <br>●	`Modal.module.css` — <br>●	`Modal.tsx` — <br>●	`NotebookArchiveModal.module.css` — <br>●	`NotebookArchiveModal.tsx` — <br>●	`SettingsModal.module.css` — <br>●	`SettingsModal.tsx` — Settings/preferences modal (e.g., theme)<br>

</details><details>
  <summary><code>notesMenu/</code> — Note switching/opening menu<br></summary>

●	`NoteActionsDropdown.module.css` — <br>●	`NoteActionsDropdown.tsx` — <br>●	`NoteListItem.tsx` — <br>●	`NotesMenu.module.css` — <br>●	`NotesMenu.tsx` — Menu to switch or open notes<br>

</details><details>
  <summary><code>tooltips/</code> — Tooltip UI components<br></summary>

●	`tooltip.css` — CSS for tooltips<br>●	`Tooltip.tsx` — Tooltip wrapper for hover text<br>

</details><details>
  <summary><code>zOutdated/</code> — <br></summary>

●	`HeaderBar.tsx` — <br>●	`MathCell.tsx` — <br>●	`MathNotationTool.tsx` — <br>●	`TextCell.tsx` — <br>●	`Toolbar.tsx` — <br>

</details>

</details><details>
  <summary><code>constants/</code> — <br></summary>

●	`premadeMathCollections.ts` — <br>

</details><details>
  <summary><code>hooks/</code> — React hooks for state and interaction<br></summary>

●	`DragContext.ts` — Global drag context<br>●	`DragProvider.tsx` — <br>●	`EditorHistoryContext.tsx` — Context for editor history<br>●	`EditorHistoryProvider.tsx` — Provider for history context<br>●	`EditorModeContext.ts` — <br>●	`EditorModeProvider.tsx` — <br>●	`HoverContext.ts` — <br>●	`HoverProvider.tsx` — <br>●	`toastContext.ts` — <br>●	`useCellDragState.ts` — Hook for dragging cells (in notebook)<br>●	`useDragContext.ts` — <br>●	`useDragState.ts` — Hook for dragging MathNodes (OUTDATED)<br>●	`useEditorHistory.ts` — Hook for editor history (OUTDATED)<br>●	`useEditorMode.ts` — <br>●	`useHover.ts` — <br>●	`useHoverState.ts` — Hover state for MathNodes<br>●	`useToast.ts` — <br>●	`useZoom.ts` — Zoom control hook for MathEditor<br>

</details><details>
  <summary><code>logic/</code> — Core MathEditor logic (cursor, input, history)<br></summary>

●	`cursor.ts` — CursorPosition: container + index<br>●	`deletion.ts` — Backspace handler<br>●	`editor-state.ts` — Editor state type (rootNode, cursor)<br>●	`global-history.ts` — Global cell history (id-order mapping)<br>●	`handle-keydown.ts` — MathEditor keydown handler<br>●	`history.ts` — HistoryState (OUTDATED format)<br>●	`insertion.ts` — Character insertion logic<br>●	`navigation.ts` — Arrow key navigation in MathEditor<br>●	`node-manipulation.ts` — MathNode insert/delete logic<br>●	`transformations.ts` — MathNode transformations (e.g. wrap in fraction)<br>

</details><details>
  <summary><code>models/</code> — Types and models for nodes, notes, etc.<br></summary>

●	`latexParser.ts` — Parses LaTeX into MathNode tree<br>●	`libraryTypes.ts` — LibraryEntry interface (metadata, LaTeX, etc.)<br>●	`nodeFactories.ts` — Factories for MathNode types<br>●	`nodeToLatex.ts` — Converts MathNode to LaTeX string<br>●	`noteTypes.ts` — Types for CellData, NoteMetadata, Note<br>●	`specialSequences.ts` — Escape → MathNode mappings<br>●	`textTypes.ts` — <br>●	`transformations.ts` — Helper transforms (WIP/boilerplate)<br>●	`types.ts` — Full MathNode type definition<br>

</details><details>
  <summary><code>styles/</code> — Global CSS styles<br></summary>

●	`accents.css` — CSS for accented math nodes<br>●	`cells.css` — Styles for cells and insert zones<br>●	`hotkeyOverlay.css` — CSS for hotkey overlay & settings modal<br>●	`latexOutputColoring.css` — LaTeX viewer syntax coloring<br>●	`math-node-old.css` — <br>●	`math-node.css` — Styling for MathNode components<br>●	`math.css` — Outdated math styles<br>●	`settings.css` — Settings toggles styling<br>●	`styles.css` — Base UI styles: headers, overlays, containers<br>●	`textStyles.module.css` — <br>●	`themes.css` — Root theme styles (dark/light, scrollbars)<br>

</details><details>
  <summary><code>utils/</code> — Utility functions for MathNode operations<br></summary>

●	`accentUtils.ts` — Maps decorations to LaTeX packages<br>●	`bracketUtils.ts` — Bracket style definitions<br>●	`collectionUtils.ts` — Init functions for library collections<br>●	`dateUtils.ts` — <br>●	`mathHoverUtils.ts` — MathNode hover event handlers<br>●	`navigationUtils.ts` — Cursor movement helpers<br>●	`noop.ts` — `noop` function: `() => {}`<br>●	`noteUtils.tsx` — <br>●	`stringUtils.ts` — <br>●	`subsupUtils.ts` — CornerPosition helper (used in transforms)<br>●	`textContainerUtils.ts` — Unused: split MultiDigit nodes<br>●	`treeUtils.ts` — Tree manipulation for MathNodes<br>

</details>

</details>