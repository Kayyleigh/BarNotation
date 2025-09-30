// components/mathExpression/MathRenderer.tsx
import React from "react";
import type { BigOperatorNode, ChildedNode, DecoratedNode, FractionNode, GroupNode, InlineContainerNode, MathNode, MatrixNode, MultiDigitNode, NthRootNode, OverUndersetNode, RootWrapperNode, StyledNode, TextNode, TextStyle } from "../../models/mathNodeTypes";
import type { CursorPosition } from "../../logic/cursor";
import type { EditorState } from "../../logic/editor-state";
import type { DragSource, DropTarget } from "../../models/dragTypes";
import { CommandInputRenderer } from "./CommandInputRenderer";
import { TextNodeRenderer } from "./mathRenderers/TextNoderenderer";
import { FractionNodeRenderer } from "./mathRenderers/FractionNoderenderer";
import { MultiDigitNodeRenderer } from "./mathRenderers/MultiDigitNodeRenderer";
import { RootWrapperNodeRenderer } from "./mathRenderers/RootWrapperNodeRenderer";
import { BigOperatorNodeRenderer } from "./mathRenderers/BigOperatorNodeRenderer";
import { GroupNodeRenderer } from "./mathRenderers/GroupNodeRenderer";
import { NthRootNodeRenderer } from "./mathRenderers/NthRootNodeRenderer";
import { ChildedNodeRenderer } from "./mathRenderers/ChildedNodeRenderer";
import { DecoratedNodeRenderer } from "./mathRenderers/DecoratedNodeRenderer";
import { StyledNodeRenderer } from "./mathRenderers/StyledNodeRenderer";
import { OverUndersetNodeRenderer } from "./mathRenderers/OverUndersetNodeRenderer";
import { MatrixNodeRenderer } from "./mathRenderers/MatrixNodeRenderer";
import { InlineContainerNodeRenderer } from "./mathRenderers/InlineContainerNodeRenderer";

export interface CoreRenderProps<TNode extends MathNode = MathNode> {
  node: TNode;
  cellId: string;
  isActive: boolean;
  containerId: string;
  index: number;
  inheritedStyle: TextStyle;
  cursor: CursorPosition;
  hoverPath: string[];
  ancestorIds: string[];
  setHoverPath: (path: string[]) => void;
  onCursorChange: (pos: CursorPosition) => void;
  onDropNode: (from: DragSource, to: DropTarget) => void;
  showPlaceholder?: boolean;
  updateEditorState: (newState: EditorState) => void;
  editorState: EditorState;
  focusEditor: () => void
  readOnly?: boolean;
};

function renderNode<T extends MathNode>(
  node: T,
  props: CoreRenderProps<T>
): React.ReactNode {
  const updatedAncestors = [...(props.ancestorIds ?? []), node.id];

  const updatedProps = { ...props, ancestorIds: updatedAncestors }; // override ancestorIds

  //TODO efficiently pass updated ancestorIds instead of old one, with props
  switch (node.type) {
    case "text":
      return <TextNodeRenderer {...(updatedProps as CoreRenderProps<TextNode>)} />;
    case "multi-digit":
      return <MultiDigitNodeRenderer {...(updatedProps as CoreRenderProps<MultiDigitNode>)} />;
    case "command-input":
      return <CommandInputRenderer node={node} baseProps={updatedProps} Renderer={MathRenderer} />;
    case "inline-container":
      return <InlineContainerNodeRenderer {...(updatedProps as CoreRenderProps<InlineContainerNode>)} />;
    case "group":
      return <GroupNodeRenderer {...(updatedProps as CoreRenderProps<GroupNode>)} />;
    case "fraction":
      return <FractionNodeRenderer {...(updatedProps as CoreRenderProps<FractionNode>)} />;
    case "nth-root":
      return <NthRootNodeRenderer {...(updatedProps as CoreRenderProps<NthRootNode>)} />;
    case "big-operator":
      return <BigOperatorNodeRenderer {...(updatedProps as CoreRenderProps<BigOperatorNode>)} />;
    case "childed":
      return <ChildedNodeRenderer {...(updatedProps as CoreRenderProps<ChildedNode>)} />;
    case "decorated":
      return <DecoratedNodeRenderer {...(updatedProps as CoreRenderProps<DecoratedNode>)} />;
    case "overunderset":
      return <OverUndersetNodeRenderer {...(updatedProps as CoreRenderProps<OverUndersetNode>)} />;
    case "styled":
      return <StyledNodeRenderer {...(updatedProps as CoreRenderProps<StyledNode>)} />;
    case "matrix":
      return <MatrixNodeRenderer {...(updatedProps as CoreRenderProps<MatrixNode>)} />;
    case "root-wrapper":
      return <RootWrapperNodeRenderer {...(updatedProps as CoreRenderProps<RootWrapperNode>)} />;
    default:
      return <span className="math-node unsupported">Unsupported node: {node.id}</span>;
  }
}

const InnerMathRenderer: React.FC<CoreRenderProps> = (props) => {
  return renderNode(props.node, props)
};

export const MathRenderer = React.memo(InnerMathRenderer, areEqual);

function areEqual(prev: CoreRenderProps, next: CoreRenderProps) {
  const nodeId = prev.node.id;

  const prevHoverPath = prev.hoverPath;
  const nextHoverPath = next.hoverPath;

  const prevHovered = prevHoverPath.includes(nodeId);
  const nextHovered = nextHoverPath.includes(nodeId);

  // Find deepest hovered node in previous and next paths (last element)
  const prevDeepestHovered = prevHoverPath[prevHoverPath.length - 1];
  const nextDeepestHovered = nextHoverPath[nextHoverPath.length - 1];

  // Determine if the deepest hovered node changed (means hover moved)
  const deepestHoveredChanged = prevDeepestHovered !== nextDeepestHovered;

  // We want to re-render if:
  // - The node's other props changed
  // - OR the hover inclusion changed for this node (true -> false or false -> true)
  // - OR the deepest hovered node changed AND this node is ancestor or equal to either prev or next deepest hovered node

  // Helper: Is node ancestor or equal to hovered node? 
  // Since hoverPath is from root to hovered node, this is true if nodeId is in hoverPath.
  const wasAncestorOfPrev = prevHovered; // nodeId in prevHoverPath
  const isAncestorOfNext = nextHovered; // nodeId in nextHoverPath

  // Should rerender if hover moved within this node's subtree
  const hoverMovedWithinSubtree = deepestHoveredChanged && (wasAncestorOfPrev || isAncestorOfNext);

  const ancestorIdChanged = prev.ancestorIds[prev.ancestorIds.length - 2] !== next.ancestorIds[next.ancestorIds.length - 2];

  // const cursorChangedHere = (prev.cursor.containerId === prev.containerId && prev.cursor.index === prev.index)
  //   || (next.cursor.containerId === next.containerId && next.cursor.index === next.index);

  // const wasCursorInPath = prev.ancestorIds.includes(prev.cursor.containerId)
  // const isCursorInPath = next.ancestorIds.includes(next.cursor.containerId)

  const propsAreEqual =
    prev.node === next.node &&
    prev.cellId === next.cellId &&
    prev.containerId === next.containerId &&
    prev.index === next.index &&
    prev.isActive === next.isActive &&
    prev.cursor === next.cursor &&
    // !cursorChangedHere &&
    prev.inheritedStyle === next.inheritedStyle &&
    !ancestorIdChanged;

  // Return true (skip re-render) only if props equal AND hover didn't move within this node's subtree AND hover inclusion unchanged
  return propsAreEqual && !hoverMovedWithinSubtree && prevHovered === nextHovered;
}

// Memoized version
// export const MathRenderer = React.memo(InnerMathRenderer, areEqual);

const InnerReadOnlyMathRenderer: React.FC<CoreRenderProps> = (props) => {
  return <>{renderNode(props.node, props)}</>;
};

export const ReadOnlyMathRenderer = React.memo(InnerReadOnlyMathRenderer, areEqual);
