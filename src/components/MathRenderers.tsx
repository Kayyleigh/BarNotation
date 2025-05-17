// MathRenderers.tsx

import React from 'react';
import { MathRenderer } from './MathRenderer';
import type { 
    MathNode, 
    TextNode, 
    InlineContainerNode, 
    GroupNode, 
    FractionNode, 
    RootNode, 
    BigOperatorNode, 
    SubSuperscriptNode,
    ActuarialSymbolNode, 
    DecoratedNode, 
    MatrixNode, 
    VectorNode 
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

export const renderSubSuperscriptNode = (
  node: SubSuperscriptNode,
  props: RenderProps
) => {
  return (
    <span className={clsx("math-node", "type-subsup")}>
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

export const renderActSymbNode = (
  node: ActuarialSymbolNode,
  props: RenderProps
) => {
  return (
    <span className={clsx("math-node", "type-subsup")}>
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

export const renderDecoratedNode = (
  node: DecoratedNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange, onRootChange } = props;
  const isCursorInside = cursor.containerId === node.child.id;

  const className = clsx(`math-node decorated-node decoration-${node.decoration}`);

  return (
    <span
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        if (node.child.children.length === 0) {
          onCursorChange({ containerId: node.child.id, index: 0 });
        }
      }}
    >
      {/* Render child inline container */}
      {node.child.children.map((child, i) => {
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
            parentContainerId={node.child.id}
            index={i + 1}
          />
        );

        return elements;
      })}

      {isCursorInside && cursor.index === node.child.children.length && (
        <span className="cursor" />
      )}
    </span>
  );
};

//TODO: nth root
//TODO: BigOperator
//TODO: vector
//TODO: matrix
// Maybe more (e.g. multi-line stuff like cases)