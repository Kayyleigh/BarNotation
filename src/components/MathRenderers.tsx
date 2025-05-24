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
} from '../models/types';
import clsx from 'clsx';
import type { CursorPosition } from '../logic/cursor';
import '../styles/math-node.css' 
import '../styles/accents.css' 
import { getCloseSymbol, getOpenSymbol } from '../utils/bracketUtils';


type RenderProps = {
  cursor: CursorPosition;
  onCursorChange: (cursor: CursorPosition) => void;
  onRootChange: (newRoot: MathNode) => void;
  parentContainerId?: string;
  index?: number;
};

export const renderTextNode = (
  node: TextNode,
  { cursor, onCursorChange, parentContainerId, index }: RenderProps
) => {
  const isSelected = cursor.containerId === node.id;

  return (
    <span
      className={clsx("math-node", "type-text", { selected: isSelected })}
      onClick={(e) => {
        e.stopPropagation();
        if (parentContainerId && index) {
          // Set cursor to position after this node in the parent container
          onCursorChange({
            containerId: parentContainerId,
            index: index, // placeholder, should be actual index
          });
        }
      }}
    >
      {node.content}
    </span>
  );
};


export const renderInlineContainerNode = (
  node: InlineContainerNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange } = props;

  const isCursorInThisContainer = cursor.containerId === node.id;

  return (
    <span
      className={clsx("math-node", "type-inline-container")}
      onClick={(e) => {
        e.stopPropagation();
        if (node.children.length === 0) {
          onCursorChange({ containerId: node.id, index: 0 });
        }
      }}
    >
      {node.children.map((child, i) => {
        const elements: React.ReactNode[] = [];

        // Render cursor before this child if applicable
        if (isCursorInThisContainer && cursor.index === i) {
          elements.push(<span key={`cursor-${i}`} className="cursor" />);
        }

        // Render the child itself
        elements.push(
          <MathRenderer
            key={child.id}
            node={child}
            cursor={cursor}
            onCursorChange={onCursorChange}
            onRootChange={props.onRootChange}
            parentContainerId={node.id}
            index={i + 1}
          />
        );

        return elements;
      })}

      {/* Cursor at the end of the container */}
      {isCursorInThisContainer && cursor.index === node.children.length && (
        <span className="cursor" />
      )}
    </span>
  );
};

export const renderFractionNode = (
  node: FractionNode,
  props: RenderProps
) => (
  <span className={clsx("math-node", "type-fraction")}>
    <div className="fraction">
      <div className="numerator">
        <MathRenderer node={node.numerator} {...props} />
      </div>
      <hr />
      <div className="denominator">
        <MathRenderer node={node.denominator} {...props} />
      </div>
    </div>
  </span>
);

export const renderGroupNode = (
  node: GroupNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange, onRootChange } = props;
  const isCursorInGroup = cursor.containerId === node.child.id;

  // Render cursor inside group's inline container before child i if cursor.index === i
  return (
    <span className={clsx("math-node", "type-group", `bracket-${node.bracketStyle}`)}>
      <span className="bracket bracket-open">{getOpenSymbol(node.bracketStyle)}</span>

      <span
        className="group-contents"
        onClick={e => {
          e.stopPropagation();
          // If group contents empty, place cursor at start
          if (node.child.children.length === 0) {
            onCursorChange({ containerId: node.child.id, index: 0 });
          }
        }}
      >
        {node.child.children.map((child, i) => {
          const elements: React.ReactNode[] = [];

          if (isCursorInGroup && cursor.index === i) {
            elements.push(<span key={`cursor-${i}`} className="cursor" />);
          }

          elements.push(
            <MathRenderer
              key={child.id}
              node={child}
              cursor={cursor}
              onCursorChange={onCursorChange}
              onRootChange={onRootChange}
              parentContainerId={node.child.id}
              index={i + 1}
            />
          );

          return elements;
        })}

        {isCursorInGroup && cursor.index === node.child.children.length && (
          <span className="cursor" />
        )}
      </span>

      <span className="bracket bracket-close">{getCloseSymbol(node.bracketStyle)}</span>
    </span>
  );
};

export const renderChildedNode = (
  node: ChildedNode,
  props: RenderProps
) => {
  return (
    <span 
      className={clsx("math-node", "type-subsup")}
      style={{ backgroundColor: node.variant === 'subsup' ? '#FFAAAA' : '#AAAAFF' }}
    >
      {/* Superscript left */}
      <span className="sup-left">
        <MathRenderer node={node.supLeft} {...props} />
      </span>

      {/* Subscript left */}
      <span className="sub-left">
        <MathRenderer node={node.subLeft} {...props} />
      </span>

      {/* Base */}
      <span className="base">
        <MathRenderer node={node.base} {...props} />
      </span>

      {/* Subscript right */}
      <span className="sub-right">
        <MathRenderer node={node.subRight} {...props} />
      </span>

      {/* Superscript right */}
      <span className="sup-right">
        <MathRenderer node={node.supRight} {...props} />
      </span>
    </span>
  );
};

export const renderAccentedNode = (
  node: AccentedNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange, onRootChange } = props;
  const isCursorInside = cursor.containerId === node.base.id;

  let className;

  if (node.accent.type === "predefined") {
    className = clsx(`math-node decorated-node decoration-${node.accent.name}`);
  }
  else {
    className = clsx(`math-node decorated-node decoration-custom`);
  }

  return (
    <span
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        if (node.base.children.length === 0) {
          onCursorChange({ containerId: node.base.id, index: 0 });
        }
      }}
    >
      {/* Render child inline container */}
      {node.base.children.map((child, i) => {
        const elements: React.ReactNode[] = [];

        if (isCursorInside && cursor.index === i) {
          elements.push(<span key={`cursor-${i}`} className="cursor" />);
        }

        elements.push(
          <MathRenderer
            key={child.id}
            node={child}
            cursor={cursor}
            onCursorChange={onCursorChange}
            onRootChange={onRootChange}
            parentContainerId={node.base.id}
            index={i + 1}
          />
        );

        return elements;
      })}

      {isCursorInside && cursor.index === node.base.children.length && (
        <span className="cursor" />
      )}
    </span>
  );
};

//renderNthRootNode(node, props);
//renderBigOperatorNode(node, props);
//renderChildedNode(node, props);
//renderAccentedNode(node, props);
//renderMatrixNode(node, props);
//renderVectorNode(node, props);
//renderBinomNode(node, props);
//renderArrowNode(node, props);
//renderCasesNode(node, props);
//renderStyledNode(node, props);
//renderMultilineNode(node, props);
//renderRootWrapperNode(node, props);