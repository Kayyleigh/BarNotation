// MathRenderers.tsx

import React from 'react';
import { MathRenderer } from './MathRenderer';
import type {
  MathNode,
  TextNode,
  InlineContainerNode,
  GroupNode,
  FractionNode,
  ChildedNode,
  AccentedNode,
  StyledNode,
  TextStyle,
  MultiDigitNode,
  CommandInputNode,
  BigOperatorNode,
  RootWrapperNode,
  NthRootNode,
} from '../models/types';
import clsx from 'clsx';
import type { CursorPosition } from '../logic/cursor';

import '../styles/math-node.css';
import '../styles/accents.css';
import { getCloseSymbol, getOpenSymbol, isClosingBracket, isOpeningBracket } from '../utils/bracketUtils';

type RenderProps = {
  cursor: CursorPosition;
  hoveredId?: string;
  onCursorChange: (cursor: CursorPosition) => void;
  onRootChange: (newRoot: MathNode) => void;

  // Drag-and-drop handlers
  onStartDrag: (nodeId: string) => void;
  onUpdateDropTarget: (targetId: string, targetIndex: number) => void;
  onHandleDrop: () => void;
  onClearDrag: () => void;
  
  parentContainerId?: string;
  index?: number;
  onHoverChange: (hoveredId?: string) => void;
  inheritedStyle?: TextStyle;
  ancestorIds?: string[]; // list of ancestor node ids from closest to farthest
};

// ---------- Helper Utilities ----------

function getStyleClass(style?: TextStyle): string {
  return clsx({
    "math-style-normal": style?.fontStyling?.fontStyle === "normal",
    "math-style-upright": style?.fontStyling?.fontStyle === "upright",
    "math-style-command": style?.fontStyling?.fontStyle === "command",
    "math-style-bold": style?.fontStyling?.fontStyle === "bold",
    "math-style-calligraphic": style?.fontStyling?.fontStyle === "calligraphic",
    "math-style-blackboard": style?.fontStyling?.fontStyle === "blackboard",
  });
}

function getInlineStyle(style?: TextStyle): React.CSSProperties {
  return {
    color: style?.color,
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
  };
}

let hoverClearTimeout: number | null = null;

function handleMouseEnter(nodeId: string, onHoverChange: (id?: string) => void) {
  if (hoverClearTimeout) {
    clearTimeout(hoverClearTimeout);
    hoverClearTimeout = null;
  }
  onHoverChange(nodeId);
}

function handleMouseLeave(
  e: React.MouseEvent,
  nodeId: string,
  ancestorIds: string[] = [],
  onHoverChange: (id?: string) => void
) {
  const related = e.relatedTarget as HTMLElement | null;

  if (related && related instanceof Node && e.currentTarget.contains(related)) {
    return;
  }

  // Check ancestors from closest to farthest
  for (const ancestorId of ancestorIds) {
    const ancestorElem = document.querySelector(`[data-nodeid="${ancestorId}"]`);
    if (ancestorElem && related instanceof Node && ancestorElem.contains(related)) {
      onHoverChange(ancestorId);
      return;
    }
  }

  hoverClearTimeout = window.setTimeout(() => {
    onHoverChange(undefined);
    hoverClearTimeout = null;
  }, 1);
}


function getIsHovered(node: MathNode, props: RenderProps): boolean {
  if (props.hoveredId === node.id) {
    return true;
  }
  return false;
}

function renderContainerChildren(
  children: MathNode[],
  containerId: string,
  props: RenderProps,
  inheritedStyle?: TextStyle
): React.ReactNode {
  const { cursor, hoveredId, onCursorChange, onRootChange, onHoverChange, ancestorIds } = props;
  const isCursorInThisContainer = cursor.containerId === containerId;
  const newAncestorIds = [containerId, ...(ancestorIds ?? [])];

  return (
    <>
      {children.map((child, i) => {
        const elements: React.ReactNode[] = [];

        if (isCursorInThisContainer && cursor.index === i) {
          elements.push(<span key={`cursor-${i}`} className="cursor" />);
        }

        elements.push(
          <MathRenderer
					  {...props}
            key={child.id}
            node={child}
            cursor={cursor}
            hoveredId={hoveredId}
            onCursorChange={onCursorChange}
            onRootChange={onRootChange}
            onHoverChange={onHoverChange}
            parentContainerId={containerId}
            ancestorIds={newAncestorIds}
            index={i + 1}
            inheritedStyle={inheritedStyle}
          />
        );

        return elements;
      })}
      {isCursorInThisContainer && cursor.index === children.length && (
        <span className="cursor" />
      )}
    </>
  );
}

// ---------- Renderers ----------

export const renderTextNode = (
  node: TextNode,
  props: RenderProps
) => {

  const { index, parentContainerId, onCursorChange, inheritedStyle } = props;

  const isSelected = props.cursor.containerId === node.id; //TODO: remove? I don't think I am using this anymore

  const className = clsx(
    "math-node",
    "type-text",
    { selected: isSelected },
    { hovered: getIsHovered(node, props) },
    { "bracket-node": isOpeningBracket(node.content) || isClosingBracket(node.content) },
    getStyleClass(inheritedStyle)
  );

  const style = getInlineStyle(inheritedStyle);

  return (
    <span
      data-nodeid={node.id}
      className={className}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        if (parentContainerId && index) {
          onCursorChange({ containerId: parentContainerId, index });
        }
      }}
      onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
      onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}
    >
      {node.content}
    </span>
  );
};

export const renderStyledNode = (node: StyledNode, props: RenderProps) => {
  const mergedStyle: TextStyle = {
    ...props.inheritedStyle,
    ...node.style,
  };
  const newAncestorIds = [node.id, ...(props.ancestorIds ?? [])];

  return (
    <span 
      data-nodeid={node.id}
      className={getStyleClass(mergedStyle)} 
      style={getInlineStyle(mergedStyle)}
    >
      <MathRenderer
        node={node.child}
        {...props} 
        ancestorIds={newAncestorIds}
        inheritedStyle={mergedStyle}
      />
    </span>
  );
};

export const renderRootWrapperNode = (
  node: RootWrapperNode,
  props: RenderProps
) => {
  const child = node.child;
  if (!child) return <span className="math-node root-wrapper-empty" />;

  const newAncestorIds = [node.id, ...(props.ancestorIds ?? [])];

  return (
    <span 
      data-nodeid={node.id}
      className="math-node root-wrapper"
    >
      <MathRenderer
        node={child}
        {...props} 
        ancestorIds={newAncestorIds}
        parentContainerId={node.id}
        index={0}
      />
    </span>
  );
};

export const renderMultiDigitNode = (
  node: MultiDigitNode,
  props: RenderProps
) => {
  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node", 
        "type-multi-digit",
        { hovered: getIsHovered(node, props) },
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (node.children.length === 0) {
          props.onCursorChange({ containerId: node.id, index: 0 });
        }
      }}
      onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
      onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}
    >
      {renderContainerChildren(node.children, node.id, props, props.inheritedStyle)}
    </span>
  );
};

export const renderCommandInputNode = (
  node: CommandInputNode,
  props: RenderProps
) => (
  <span
    data-nodeid={node.id}
    className={clsx(
      "math-node", 
      "type-command-input", 
      "font-mono", 
      "text-gray-600",     
      { hovered: getIsHovered(node, props) },
    )}
    onClick={(e) => {
      e.stopPropagation();
      if (node.children.length === 0) {
        props.onCursorChange({ containerId: node.id, index: 0 });
      }
    }}
    onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
    onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}
  >
    {renderContainerChildren(node.children, node.id, props, { fontStyling: { fontStyle: 'command', fontStyleAlias: "" } })}
  </span>
);

export const renderInlineContainerNode = (
  node: InlineContainerNode,
  props: RenderProps
) => (
  <span
    data-nodeid={node.id}
    className={clsx(
      "math-node", 
      "type-inline-container",
      { hovered: getIsHovered(node, props) },
    )}
    onClick={(e) => {
      e.stopPropagation();
      if (node.children.length === 0) {
        props.onCursorChange({ containerId: node.id, index: 0 });
      }
    }}
    onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
    onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}
  >
    {renderContainerChildren(node.children, node.id, props, props.inheritedStyle)}
  </span>
);

export const renderFractionNode = (
  node: FractionNode,
  props: RenderProps
) => (
  <span
    data-nodeid={node.id}
    className={clsx(
      "math-node", 
      "type-fraction",
      { hovered: getIsHovered(node, props) },
    )}
    onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
    onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}

  >
    <div className="fraction">
      <div className="numerator">
        <MathRenderer
					node={node.numerator} 
          {...props} 
          ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} 
        />
      </div>
      <hr />
      <div className="denominator">
        <MathRenderer
					node={node.denominator} 
          {...props} 
          ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} 
        />
      </div>
    </div>
  </span>
);

export const renderGroupNode = (
  node: GroupNode,
  props: RenderProps
) => (
  <span
    data-nodeid={node.id}  
    className={clsx(
      "math-node", 
      "type-group", 
      `bracket-${node.bracketStyle}`,
      { hovered: getIsHovered(node, props) },
    )}
    onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
    onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}

  >
    <span className="bracket bracket-open">{getOpenSymbol(node.bracketStyle)}</span>
    <span
      className="group-contents"
      onClick={(e) => {
        e.stopPropagation();
        if (node.child.children.length === 0) {
          props.onCursorChange({ containerId: node.child.id, index: 0 });
        }
      }}
    >
      <MathRenderer
        node={node.child} 
        {...props} 
        ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} 
      />
    </span>
    <span className="bracket bracket-close">{getCloseSymbol(node.bracketStyle)}</span>
  </span>
);

export const renderChildedNode = (
  node: ChildedNode,
  props: RenderProps
) => (
  <span
    data-nodeid={node.id}
    className={clsx(
      "math-node", 
      "type-childed", 
      node.variant === 'subsup' ? "type-subsup" : "type-actsymb",
      { hovered: getIsHovered(node, props) },
    )}
    onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
    onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}

  >
    <span className="sup-left"><MathRenderer
					node={node.supLeft} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
    <span className="sub-left"><MathRenderer
					node={node.subLeft} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
    <span className="base"><MathRenderer
					node={node.base} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
    <span className="sub-right"><MathRenderer
					node={node.subRight} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
    <span className="sup-right"><MathRenderer
					node={node.supRight} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
  </span>
);

export const renderAccentedNode = (
  node: AccentedNode,
  props: RenderProps
) => {
  const renderCustomAccent = (position: "above" | "below") => (
    <div className={`accent-content accent-${position}`}>
      <MathRenderer
        node={node.accent.content}
        {...props} 
        ancestorIds={[node.id, ...(props.ancestorIds ?? [])]}
        parentContainerId={node.accent.content.id}
        index={0}
      />
    </div>
  );

  const isCustom = node.accent.type === "custom";

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node decorated-node",
        isCustom ? "decoration-custom" : `decoration-${node.accent.decoration}`,
        { hovered: getIsHovered(node, props) },
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (node.base.children.length === 0) {
          props.onCursorChange({ containerId: node.base.id, index: 0 });
        }
      }}
      onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
      onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}
    >
      {isCustom && node.accent.position === "above" && renderCustomAccent("above")}
      <span className="accent-base">
        <MathRenderer
					node={node.base} 
          {...props} 
          ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} 
        /></span>
      {isCustom && node.accent.position === "below" && renderCustomAccent("below")}
    </span>
  );
};

export const renderBigOperatorNode = (
  node: BigOperatorNode,
  props: RenderProps
) => (
  <span
    data-nodeid={node.id}
    className={clsx(
      "math-node", 
      "type-big-operator",
      { hovered: getIsHovered(node, props) },
    )}
    onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
    onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}

  >
    <div className="big-operator-wrapper">
      <div className="big-operator-upper">
        <MathRenderer
					node={node.upper} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} />
      </div>
      <div className="big-operator-symbol">{node.operator}</div>
      <div className="big-operator-lower">
        <MathRenderer
					node={node.lower} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} />
      </div>
    </div>
  </span>
);

export const renderNthRootNode = (
  node: NthRootNode,
  props: RenderProps
) => (
  <span
    data-nodeid={node.id}
    className={clsx(
      "math-node", 
      "type-nth-root",
      { hovered: getIsHovered(node, props) },
    )}
    onMouseEnter={() => handleMouseEnter(node.id, props.onHoverChange!)}
    onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.onHoverChange!)}
  >
    <span className="root-wrapper">
      <span className="nth-index">
        <MathRenderer
					node={node.index} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} parentContainerId={node.id} index={0} />
      </span>
      <span className="radical-symbol">√</span>
      <span className="radicand">
        <MathRenderer
				  node={node.base} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} parentContainerId={node.id} index={1} />
      </span>
    </span>
  </span>
);
