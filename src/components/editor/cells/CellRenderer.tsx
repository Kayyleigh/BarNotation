// // components/editor/cells/CellRenderer.tsx
// import React, { useMemo, useCallback, useRef } from "react";
// import type { CellData, TextCellContent } from "../../../models/noteTypes";
// import type { EditorState } from "../../../logic/editor-state";
// import InsertCellButtons from "./InsertCellButtons";
// import { cellRegistry, type CellType, type CellContent } from "../../../models/cellRegistry";
// import { CellWrapper } from "./cellWrapper";
// import type { DragSource, DropTarget } from "../../../models/dragTypes";
// import { useI18n } from "../../../i18n/useI18n";
// import LatexViewer from "../../mathExpression/LatexViewer";

// export interface CellRendererProps {
//   cell: CellData;
//   index: number;
//   selectedCellId: string | null;
//   setSelectedCellId: (id: string | null) => void;
//   handleInsertAtIndex: (type: CellType, idx: number) => void;
//   handlePointerDown: (e: React.PointerEvent, id: string, index: number) => void;
//   deleteCell: (id: string) => void;
//   duplicateCell: (id: string) => void;
//   updateTextCellContent: (id: string, partialContent: Partial<TextCellContent>) => void;
//   toggleShowLatex: (id: string) => void;
//   showLatexMap: Record<string, boolean>;
//   onDropNode: (from: DragSource, to: DropTarget) => void;
//   resetZoomSignal: number;
//   defaultZoom: number;
//   editorStates: Record<string, EditorState>;
//   updateEditorState: (id: string, newState: EditorState) => void;
//   draggingCellId: string | null;
//   dragOverInsertIndex: number | null;
//   updateDragOver: (index: number) => void;
// }

// export const CellRenderer = React.memo(
//   React.forwardRef<HTMLDivElement, CellRendererProps>((props, ref) => {
//     const {
//       cell,
//       index,
//       selectedCellId,
//       setSelectedCellId,
//       handleInsertAtIndex,
//       handlePointerDown,
//       deleteCell,
//       duplicateCell,
//       updateTextCellContent,
//       toggleShowLatex,
//       showLatexMap,
//       onDropNode,
//       resetZoomSignal,
//       defaultZoom,
//       editorStates,
//       updateEditorState,
//       draggingCellId,
//       dragOverInsertIndex,
//       updateDragOver,
//     } = props;

//     const { t } = useI18n();

//     const registryEntry = cellRegistry[cell.type as CellType];
//     type ContentType = CellContent<typeof cell.type>;
//     const Component = registryEntry.component as React.FC<any>;

//     const typeLabel = useMemo(
//       () => registryEntry.getLabel?.(cell.content as ContentType) ?? registryEntry.label,
//       [registryEntry, cell.content]
//     );

//     const toolbarExtras = useMemo(() => {
//       return registryEntry.getToolbarExtras?.({
//         id: cell.id,
//         content: cell.content as any,
//         onChange: (id: string, newContent: any) => updateTextCellContent(id, newContent),
//         toggleShowLatex,
//         showLatex: showLatexMap[cell.id],
//         t,
//       });
//     }, [registryEntry, cell.id, cell.content, showLatexMap, t, toggleShowLatex, updateTextCellContent]);

//     const handleSelect = useCallback(() => setSelectedCellId(cell.id), [cell.id, setSelectedCellId]);
//     const handleDelete = useCallback(() => deleteCell(cell.id), [cell.id, deleteCell]);
//     const handleDuplicate = useCallback(() => duplicateCell(cell.id), [cell.id, duplicateCell]);
//     const handlePointerDownLocal = useCallback(
//       (e: React.PointerEvent) => handlePointerDown(e, cell.id, index),
//       [handlePointerDown, cell.id, index]
//     );

//     const componentProps = useMemo(() => {
//       const baseProps: Record<string, unknown> = {
//         id: cell.id,
//         content: cell.content as ContentType,
//         onChange:
//           cell.type === "text"
//             ? (newContent: TextCellContent) => updateTextCellContent(cell.id, newContent)
//             : (newState: EditorState) => updateEditorState(cell.id, newState),
//       };

//       if (cell.type === "math") {
//         Object.assign(baseProps, {
//           editorState: editorStates[cell.id],
//           selectedCellId,
//           setSelectedCellId,
//           defaultZoom,
//           resetZoomSignal,
//           showLatex: showLatexMap[cell.id] ?? false,
//           onDropNode,
//         });
//       }

//       return baseProps;
//     }, [
//       cell.id,
//       cell.content,
//       cell.type,
//       editorStates,
//       selectedCellId,
//       setSelectedCellId,
//       defaultZoom,
//       resetZoomSignal,
//       showLatexMap,
//       updateTextCellContent,
//       updateEditorState,
//       onDropNode,
//     ]);

//     const isDragging = draggingCellId === cell.id;
//     const isDragOver = dragOverInsertIndex === index;

//     // Stable getLatex callback for memoization
//     const getLatexRef = useRef<() => string>(() => ""); // initialize with a noop

//     // Update current on every render
//     getLatexRef.current = () =>
//       registryEntry.getLatex?.(cell.content as CellContent<typeof cell.type>) ?? "";

//     // Memoized stable callback
//     const stableGetLatex = useCallback(() => getLatexRef.current(), []);

//     const latexVersionMapRef = useRef<Map<string, number>>(new Map());

//     function markLatexOutdated(cellId: string, isCurrentlyOutdated: boolean) {
//       if (!isCurrentlyOutdated) {
//         const current = latexVersionMapRef.current.get(cellId) ?? 0;
//         latexVersionMapRef.current.set(cellId, current + 1);
//       }
//     }

//     return (
//       <div ref={ref}>
//         <InsertCellButtons
//           onInsert={(type) => handleInsertAtIndex(type, index)}
//           handlePointerEnter={() => draggingCellId !== null && updateDragOver(index)}
//           isDropTarget={isDragOver}
//         />

//         <CellWrapper
//           id={cell.id}
//           isSelected={selectedCellId === cell.id}
//           isDragging={isDragging}
//           isDragOver={isDragOver}
//           onSelect={handleSelect}
//           onDelete={handleDelete}
//           onDuplicate={handleDuplicate}
//           draggableProps={{ onPointerDown: handlePointerDownLocal }}
//           typeLabel={typeLabel}
//           toolbarExtras={toolbarExtras}
//         >
//           <Component {...componentProps} />
//         </CellWrapper>

//         {registryEntry.hasLatex && (
//           <LatexViewer
//             showLatex={showLatexMap[cell.id] ?? false}
//             getLatex={stableGetLatex}
//             contentVersion={latexVersionMapRef.current.get(cell.id) ?? 0}
//           />
//         )}

//       </div>
//     );
//   })
// );

// CellRenderer.displayName = "CellRenderer";

// components/editor/cells/CellRenderer.tsx
import React, { useMemo, useCallback, useRef } from "react";
import type { CellData, TextCellContent } from "../../../models/noteTypes";
import type { EditorState } from "../../../logic/editor-state";
import InsertCellButtons from "./InsertCellButtons";
import { cellRegistry, type CellType, type CellContent } from "../../../models/cellRegistry";
import { CellWrapper } from "./cellWrapper";
import type { DragSource, DropTarget } from "../../../models/dragTypes";
import { useI18n } from "../../../i18n/useI18n";
import LatexViewer from "../../mathExpression/LatexViewer";

export interface CellRendererProps {
  cell: CellData;
  index: number;
  selectedCellId: string | null;
  setSelectedCellId: (id: string | null) => void;
  handleInsertAtIndex: (type: CellType, idx: number) => void;
  handlePointerDown: (e: React.PointerEvent, id: string, index: number) => void;
  deleteCell: (id: string) => void;
  duplicateCell: (id: string) => void;
  updateTextCellContent: (id: string, partialContent: Partial<TextCellContent>) => void;
  toggleShowLatex: (id: string) => void;
  showLatexMap: Record<string, boolean>;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  resetZoomSignal: number;
  defaultZoom: number;
  editorStates: Record<string, EditorState>;
  updateEditorState: (id: string, newState: EditorState) => void;
  draggingCellId: string | null;
  dragOverInsertIndex: number | null;
  updateDragOver: (index: number) => void;
}

export const CellRenderer = React.memo(
  React.forwardRef<HTMLDivElement, CellRendererProps>((props, ref) => {
    const {
      cell,
      index,
      selectedCellId,
      setSelectedCellId,
      handleInsertAtIndex,
      handlePointerDown,
      deleteCell,
      duplicateCell,
      updateTextCellContent,
      toggleShowLatex,
      showLatexMap,
      onDropNode,
      resetZoomSignal,
      defaultZoom,
      editorStates,
      updateEditorState,
      draggingCellId,
      dragOverInsertIndex,
      updateDragOver,
    } = props;

    const { t } = useI18n();

    const registryEntry = cellRegistry[cell.type as CellType];
    type ContentType = CellContent<typeof cell.type>;
    const Component = registryEntry.component as React.FC<any>;

    const typeLabel = useMemo(
      () => registryEntry.getLabel?.(cell.content as ContentType) ?? registryEntry.label,
      [registryEntry, cell.content]
    );

    const toolbarExtras = useMemo(() => {
      return registryEntry.getToolbarExtras?.({
        id: cell.id,
        content: cell.content as any,
        onChange: (id: string, newContent: any) => updateTextCellContent(id, newContent),
        toggleShowLatex,
        showLatex: showLatexMap[cell.id],
        t,
      });
    }, [registryEntry, cell.id, cell.content, showLatexMap, t, toggleShowLatex, updateTextCellContent]);

    const handleSelect = useCallback(() => setSelectedCellId(cell.id), [cell.id, setSelectedCellId]);
    const handleDelete = useCallback(() => deleteCell(cell.id), [cell.id, deleteCell]);
    const handleDuplicate = useCallback(() => duplicateCell(cell.id), [cell.id, duplicateCell]);
    const handlePointerDownLocal = useCallback(
      (e: React.PointerEvent) => handlePointerDown(e, cell.id, index),
      [handlePointerDown, cell.id, index]
    );

    const latexVersionMapRef = useRef<Map<string, number>>(new Map());

    const markLatexOutdated = useCallback((cellId: string) => {
      const current = latexVersionMapRef.current.get(cellId) ?? 0;
      latexVersionMapRef.current.set(cellId, current + 1);
    }, []);

    const handleTextCellChange = useCallback(
      //TODO why is this even needed? TextCell has no LatexViewer
      (id: string, newContent: Partial<TextCellContent>) => {
        updateTextCellContent(id, newContent);
        markLatexOutdated(id);
      },
      [updateTextCellContent, markLatexOutdated]
    );

    const handleEditorStateChange = useCallback(
      (id: string, newState: EditorState) => {
        const oldState = editorStates[id];
        updateEditorState(id, newState);
        if (oldState.rootNode !== newState.rootNode) markLatexOutdated(id);
      },
      [editorStates, updateEditorState, markLatexOutdated]
    );

    const componentProps = useMemo(() => {
      const baseProps: Record<string, unknown> = {
        id: cell.id,
        content: cell.content as ContentType,
        onChange:
          cell.type === "text"
            ? (newContent: TextCellContent) => handleTextCellChange(cell.id, newContent)
            : (newState: EditorState) => handleEditorStateChange(cell.id, newState),
      };

      if (cell.type === "math") {
        Object.assign(baseProps, {
          editorState: editorStates[cell.id],
          selectedCellId,
          setSelectedCellId,
          defaultZoom,
          resetZoomSignal,
          showLatex: showLatexMap[cell.id] ?? false,
          onDropNode,
        });
      }

      return baseProps;
    }, [
      cell.id,
      cell.content,
      cell.type,
      editorStates,
      selectedCellId,
      setSelectedCellId,
      defaultZoom,
      resetZoomSignal,
      showLatexMap,
      handleTextCellChange,
      handleEditorStateChange,
      onDropNode,
    ]);

    const isDragging = draggingCellId === cell.id;
    const isDragOver = dragOverInsertIndex === index;

    const getLatexRef = useRef<() => string>(() => "");
    getLatexRef.current = () =>
      registryEntry.getLatex?.(cell.content as CellContent<typeof cell.type>) ?? "";
    const stableGetLatex = useCallback(() => getLatexRef.current(), []);

    return (
      <div ref={ref}>
        <InsertCellButtons
          onInsert={(type) => handleInsertAtIndex(type, index)}
          handlePointerEnter={() => draggingCellId !== null && updateDragOver(index)}
          isDropTarget={isDragOver}
        />

        <CellWrapper
          id={cell.id}
          isSelected={selectedCellId === cell.id}
          isDragging={isDragging}
          isDragOver={isDragOver}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          draggableProps={{ onPointerDown: handlePointerDownLocal }}
          typeLabel={typeLabel}
          toolbarExtras={toolbarExtras}
        >
          <Component {...componentProps} />
        </CellWrapper>

        {registryEntry.hasLatex && (
          <LatexViewer
            showLatex={showLatexMap[cell.id] ?? false}
            getLatex={stableGetLatex}
            contentVersion={latexVersionMapRef.current.get(cell.id) ?? 0}
          />
        )}
      </div>
    );
  })
);

CellRenderer.displayName = "CellRenderer";
