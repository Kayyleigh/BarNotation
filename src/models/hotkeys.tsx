// hotkeys.ts
import React from "react";
import { ChildedNode, FractionNode, InlineContainerNode, MatrixNode, OverUndersetNode, TextNode } from "./mathNodeTypes";
import MathView from "../components/mathExpression/MathView";
import styles from "../components/modals/HotkeyOverlay.module.css";

export interface HotkeyGroup {
  id: string;
  titleId: string;
  keys: Hotkey[];
  subGroups?: HotkeySubgroup[];
}

export interface HotkeySubgroup {
  id: string;
  titleId: string;
  keys: Hotkey[];
}

export interface Hotkey {
  combo: string[];
  descriptionId: string;
  preview?: React.ReactNode; // generic, can be MathView, image, etc.
}

// Preview nodes

// Empty inline-container node
const emptyICNode: InlineContainerNode = { id: "preview-empty-ic", type: "inline-container", children: [] };

// Text node for existing math + IC-wrapped version
const textNodePrev: TextNode = { id: "preview-text-1", type: "text", content: "⬚", inputAlias: "⬚" };
const textICPrev: InlineContainerNode = { id: "preview-text-ic-1", type: "inline-container", children: [textNodePrev] };

// Text node for new focus + IC-wrapped version
const textNodeFocus: TextNode = { id: "preview-text-2", type: "text", content: "■", inputAlias: "■" };
const textICFocus: InlineContainerNode = { id: "preview-text-ic-2", type: "inline-container", children: [textNodeFocus] };

// Text node for addition + IC-wrapped version
const textNodeNew: TextNode = { id: "preview-text-3", type: "text", content: "✛", inputAlias: "✛" };
const textICNew: InlineContainerNode = { id: "preview-text-ic-3", type: "inline-container", children: [textNodeNew] };

// Childed nodes
const subscriptNode: ChildedNode = { id: "preview-subscript", type: "childed", variant: "subsup", subLeft: emptyICNode, supLeft: emptyICNode, base: textICPrev, subRight: textICFocus, supRight: emptyICNode };
const supscriptNode: ChildedNode = { id: "preview-supscript", type: "childed", variant: "subsup", subLeft: emptyICNode, supLeft: emptyICNode, base: textICPrev, subRight: emptyICNode, supRight: textICFocus };
const actTLNode: ChildedNode = { id: "preview-actTL", type: "childed", variant: "actsymb", subLeft: emptyICNode, supLeft: textICFocus, base: textICPrev, subRight: emptyICNode, supRight: emptyICNode };
const actBLNode: ChildedNode = { id: "preview-actBL", type: "childed", variant: "actsymb", subLeft: textICFocus, supLeft: emptyICNode, base: textICPrev, subRight: emptyICNode, supRight: emptyICNode };
const actTRNode: ChildedNode = { id: "preview-actTR", type: "childed", variant: "actsymb", subLeft: emptyICNode, supLeft: emptyICNode, base: textICPrev, subRight: emptyICNode, supRight: textICFocus };
const actBRNode: ChildedNode = { id: "preview-actBR", type: "childed", variant: "actsymb", subLeft: emptyICNode, supLeft: emptyICNode, base: textICPrev, subRight: textICFocus, supRight: emptyICNode };

// Over/underset nodes
const oversetNode: OverUndersetNode = { id: "preview-overset", type: "overunderset", variant: "overunderset", position: "above", base: textICPrev, content: textICFocus };
const undersetNode: OverUndersetNode = { id: "preview-underset", type: "overunderset", variant: "overunderset", position: "below", base: textICPrev, content: textICFocus };
const actPrecTNode: OverUndersetNode = { id: "preview-actprect", type: "overunderset", variant: "nthtopbottom", position: "above", base: textICPrev, content: textICFocus };
const actPrecBNode: OverUndersetNode = { id: "preview-actprecb", type: "overunderset", variant: "nthtopbottom", position: "below", base: textICPrev, content: textICFocus };

// Matrix nodes
const matrixRowTNode: MatrixNode = { id: "preview-matrix-row-above", type: "matrix", bracketStyle: "square", rows: [[textICNew, textICNew], [emptyICNode, emptyICNode]] };
const matrixRowBNode: MatrixNode = { id: "preview-matrix-row-below", type: "matrix", bracketStyle: "square", rows: [[emptyICNode, emptyICNode], [textICNew, textICNew]] };
const matrixColLNode: MatrixNode = { id: "preview-matrix-col-left", type: "matrix", bracketStyle: "square", rows: [[textICNew, emptyICNode], [textICNew, emptyICNode]] };
const matrixColRNode: MatrixNode = { id: "preview-matrix-col-right", type: "matrix", bracketStyle: "square", rows: [[emptyICNode, textICNew], [emptyICNode, textICNew]] };

const fractionNode: FractionNode = { id: "preview-frac", type: "fraction", variant: "frac", numerator: textICPrev, denominator: textICFocus };


const mathHotkeySubgroups: HotkeySubgroup[] = [
  {
    id: "math-childed",
    titleId: "modals.hotkeysModal.mathInputChildedShortcuts",
    keys: [
      { combo: ["Shift", "6"], descriptionId: "modals.hotkeysModal.superscript", preview: <MathView className={styles.smallPreview} node={supscriptNode} /> },
      { combo: ["Shift", "-"], descriptionId: "modals.hotkeysModal.subscript", preview: <MathView className={styles.smallPreview} node={subscriptNode} /> },
      { combo: ["Shift", "Alt", "6"], descriptionId: "modals.hotkeysModal.actuarialTL", preview: <MathView className={styles.smallPreview} node={actTLNode} /> },
      { combo: ["Shift", "Alt", "-"], descriptionId: "modals.hotkeysModal.actuarialBL", preview: <MathView className={styles.smallPreview} node={actBLNode} /> },
      { combo: ["Alt", "6"], descriptionId: "modals.hotkeysModal.actuarialTR", preview: <MathView className={styles.smallPreview} node={actTRNode} /> },
      { combo: ["Alt", "-"], descriptionId: "modals.hotkeysModal.actuarialBR", preview: <MathView className={styles.smallPreview} node={actBRNode} /> },
    ],
  },
  {
    id: "math-overunderset",
    titleId: "modals.hotkeysModal.mathInputOverUndersetShortcuts",
    keys: [
      { combo: ["Shift", "↑"], descriptionId: "modals.hotkeysModal.overset", preview: <MathView className={styles.smallPreview} node={oversetNode} /> },
      { combo: ["Shift", "Alt", "↑"], descriptionId: "modals.hotkeysModal.nthtop", preview: <MathView className={styles.mediumPreview} node={actPrecTNode} /> },
      { combo: ["Shift", "↓"], descriptionId: "modals.hotkeysModal.underset", preview: <MathView className={styles.smallPreview} node={undersetNode} /> },
      { combo: ["Shift", "Alt", "↓"], descriptionId: "modals.hotkeysModal.nthbottom", preview: <MathView className={styles.mediumPreview} node={actPrecBNode} /> },

    ],
  },
  {
    id: "math-matrix",
    titleId: "modals.hotkeysModal.mathInputMatrixShortcuts",
    keys: [

      { combo: ["Ctrl", "↓"], descriptionId: "modals.hotkeysModal.insertMatrixRowBelow", preview: <MathView className={styles.tallPreview} node={matrixRowBNode} showPlaceHolder={true} /> },
      { combo: ["Ctrl", "→"], descriptionId: "modals.hotkeysModal.insertMatrixColumnRight", preview: <MathView className={styles.tallPreview} node={matrixColRNode} showPlaceHolder={true} /> },
      { combo: ["Ctrl", "↑"], descriptionId: "modals.hotkeysModal.insertMatrixRowAbove", preview: <MathView className={styles.tallPreview} node={matrixRowTNode} showPlaceHolder={true} /> },
      { combo: ["Ctrl", "←"], descriptionId: "modals.hotkeysModal.insertMatrixColumnLeft", preview: <MathView className={styles.tallPreview} node={matrixColLNode} showPlaceHolder={true} /> },
    ],
  },

]

export const hotkeyGroups: HotkeyGroup[] = [
  {
    id: "math",
    titleId: "modals.hotkeysModal.mathInputShortcuts",
    keys: [
      { combo: ["/"], descriptionId: "modals.hotkeysModal.fraction", preview: <MathView className={styles.mediumPreview} node={fractionNode} /> },
      { combo: ["\\"], descriptionId: "modals.hotkeysModal.command", preview: null },
    ],
    subGroups: mathHotkeySubgroups,
  },
  {
    id: "cellEditing",
    titleId: "modals.hotkeysModal.cellContentEditingAndNavigation",
    keys: [
      { combo: ["Arrow Keys"], descriptionId: "modals.hotkeysModal.navigate" },
      { combo: ["Shift", "←/→"], descriptionId: "modals.hotkeysModal.fastNavigate" },
      { combo: ["Home"], descriptionId: "modals.hotkeysModal.jumpToCellStart" },
      { combo: ["End"], descriptionId: "modals.hotkeysModal.jumpToCellEnd" },
      { combo: ["Backspace"], descriptionId: "modals.hotkeysModal.backspace" },
      { combo: ["Delete"], descriptionId: "modals.hotkeysModal.delete" },
      { combo: ["Ctrl", "C"], descriptionId: "modals.hotkeysModal.copy" },
      { combo: ["Ctrl", "X"], descriptionId: "modals.hotkeysModal.cut" },
      { combo: ["Ctrl", "V"], descriptionId: "modals.hotkeysModal.paste" },
      { combo: ["Ctrl", "Z"], descriptionId: "modals.hotkeysModal.undo" },
      { combo: ["Ctrl", "Y"], descriptionId: "modals.hotkeysModal.redo" },
      { combo: ["Drag & Drop"], descriptionId: "modals.hotkeysModal.rearrangeNodes" },
      { combo: ["Alt", ",/."], descriptionId: "modals.hotkeysModal.cycleTextTypes" },
    ],
  },
  {
    id: "cellList",
    titleId: "modals.hotkeysModal.cellListEditingAndNavigation",
    keys: [
      { combo: ["Alt", "↑"], descriptionId: "modals.hotkeysModal.navigateCellUp" },
      { combo: ["Alt", "↓"], descriptionId: "modals.hotkeysModal.navigateCellDown" },
      { combo: ["Alt", "Del"], descriptionId: "modals.hotkeysModal.deleteCurrCell" },
      { combo: ["Alt", "="], descriptionId: "modals.hotkeysModal.duplicateCurrCell" },
      { combo: ["Alt", "Digit", "↑"], descriptionId: "modals.hotkeysModal.insertCellAbove" },
      { combo: ["Alt", "Digit", "↓"], descriptionId: "modals.hotkeysModal.insertCellBelow" },
    ],
  },
  {
    id: "notebook",
    titleId: "modals.hotkeysModal.notebookShortcuts",
    keys: [
      { combo: ["Alt", "P"], descriptionId: "modals.hotkeysModal.togglePreview" },
      { combo: ["Alt", "L"], descriptionId: "modals.hotkeysModal.toggleLocked" },
      { combo: ["Alt", "1"], descriptionId: "modals.hotkeysModal.appendMath" },
      { combo: ["Alt", "2"], descriptionId: "modals.hotkeysModal.appendText" },
    ],
  },
  {
    id: "general",
    titleId: "modals.hotkeysModal.generalShortcuts",
    keys: [
      { combo: ["Ctrl", "/"], descriptionId: "modals.hotkeysModal.openHotkeyModal" },
      { combo: ["Esc"], descriptionId: "modals.hotkeysModal.closeOverlay" },
    ],
  },
  {
    id: "view",
    titleId: "modals.hotkeysModal.viewControls",
    keys: [
      { combo: ["Ctrl", "+"], descriptionId: "modals.hotkeysModal.zoomIn" },
      { combo: ["Ctrl", "-"], descriptionId: "modals.hotkeysModal.zoomOut" },
      { combo: ["Ctrl", "0"], descriptionId: "modals.hotkeysModal.zoomReset" },
    ],
  },
];
