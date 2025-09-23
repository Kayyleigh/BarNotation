// models/cellRegistry.ts
import MathCell from "../components/editor/cells/mathCell/MathCell";
import TextCell from "../components/editor/cells/textCell/TextCell";
import TextView from "../components/editor/cells/textCell/TextView";
import MathView from "../components/mathExpression/MathView";
import type { EditorState } from "../logic/editor-state";
import type { CellData, MathCellData, TextCellContent, TextCellData } from "./noteTypes";
import { TEXT_TYPE_LABELS, type TextCellType } from "./textTypes";
import styles from "../components/editor/Editor.module.css";
import { nodeToLatex } from "./nodeToLatex";
import { TextCellToolbar } from "../components/editor/cells/textCell/TextCellToolbar";
import { MathCellToolbar } from "../components/editor/cells/mathCell/MathCellToolbar";

// Editable component props
export interface BaseCellProps<TContent> {
  id: string;
  content: TContent;
  onChange: (newContent: TContent) => void;
}

// Locked component props builder
export type LockedPropsBuilder<TCell extends CellData, TExtra = unknown> = (
  cell: TCell,
  extra?: TExtra
) => object;

// Toolbar props
export type TextToolbarExtrasProps = {
  id: string;
  role: TextCellType;
  updateRole: (newRole: TextCellType) => void;
  t: (key: string) => string;
};

export type MathToolbarExtrasProps = {
  id: string;
  toggleShowLatex: (id: string) => void;
  showLatex: boolean;
  t: (key: string) => string;
};

// Generic cell type definition
export interface CellTypeDefinition<
  TCell extends CellData,
  TEditableProps = object,
  TLockedProps = object,
  TExtra = unknown
> {
  component: React.FC<BaseCellProps<TCell["content"]> & TEditableProps>;
  lockedComponent?: React.FC<TLockedProps>;
  getLockedProps?: (cell: TCell, extra?: TExtra) => TLockedProps;
  label: string;
  getLabel?: (content: TCell["content"]) => string;
  hasLatex?: boolean;
  getLatex?: (content: TCell["content"]) => string;
  getToolbarExtras?: (args: TEditableProps) => React.ReactNode;
}

// --- Registry ---
export const cellRegistry = {
  text: {
    component: TextCell,
    lockedComponent: TextView,
    getLockedProps: (cell: TextCellData, extra: { displayNumbers: Record<string, string> }) => ({
      content: cell.content,
      displayNumber: extra.displayNumbers[cell.id],
    }),
    label: "Text",
    getLabel: (content: TextCellContent) => TEXT_TYPE_LABELS[content.type],
    getToolbarExtras: (props: TextToolbarExtrasProps) => <TextCellToolbar {...props} />,

  },
  math: {
    component: MathCell,
    lockedComponent: MathView,
    getLockedProps: (cell: MathCellData) => ({
      node: cell.content.rootNode,
      className: styles.lockedMath,
      showPlaceHolder: false,
    }),
    label: "Math",
    hasLatex: true,
    getLatex: (editorState: EditorState) => nodeToLatex(editorState.rootNode, true),
    getToolbarExtras: (props: MathToolbarExtrasProps) => <MathCellToolbar {...props} />,

  },
} as const;

export type CellType = keyof typeof cellRegistry;
export type CellRegistryEntry<T extends CellType> = typeof cellRegistry[T];
export type CellContent<T extends CellType> =
  T extends "text" ? TextCellContent :
  T extends "math" ? EditorState :
  never;
