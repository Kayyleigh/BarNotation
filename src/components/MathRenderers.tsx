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
    DecoratedNode, 
    MatrixNode, 
    VectorNode 
} from '../models/types';
import clsx from 'clsx';
import type { CursorPosition } from '../logic/cursor';
import '../styles/math-node.css' 


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
      {cursor.containerId === parentContainerId && cursor.index === index && (<span className="cursor" />)}

    </span>
  );
};


export const renderInlineContainerNode = (
  node: InlineContainerNode,
  props: RenderProps
) => {
  return (
    <span className={clsx("math-node", "type-inline-container")}>
      {node.children.map((child, i) => (
        <MathRenderer 
          key={child.id} 
          node={child} 
          cursor={props.cursor}
          onCursorChange={props.onCursorChange}
          onRootChange={props.onRootChange}
          parentContainerId={node.id}
          index={i+1}
        />
      ))}
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


// export const renderRootNode = (
//   node: RootNode, 
//   { cursor, onCursorChange, onRootChange }: RenderProps
// ) => (
//   <span className={`math-node type-root ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
//     <span className="root">
//       {node.degree && <MathRenderer node={node.degree} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} />}
//       <span className="radical">√</span>
//       <MathRenderer node={node.radicand} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} />
//     </span>
//   </span>
// );

// export const renderBigOperatorNode = (
//   node: BigOperatorNode, 
//   { cursor, onCursorChange, onRootChange }: RenderProps
// ) => (
//   <span className={`math-node type-bigoperator ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
//     <span className="big-op">{node.operator}</span>
//     {node.lowerLimit && <div className="sub"><MathRenderer node={node.lowerLimit} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></div>}
//     {node.upperLimit && <div className="sup"><MathRenderer node={node.upperLimit} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></div>}
//     {/* <MathRenderer node={node.body} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /> */}
//   </span>
// );

// export const renderSubSuperscriptNode = (
//   node: SubSuperscriptNode, 
//   { cursor, onCursorChange, onRootChange }: RenderProps
// ) => (
//   <span className={`math-node type-subsuperscript ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
//     <span className="base"><MathRenderer node={node.base} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></span>
//     {node.subLeft && <sub className="sub-left"><MathRenderer node={node.subLeft} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></sub>}
//     {node.supLeft && <sup className="sup-left"><MathRenderer node={node.supLeft} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></sup>}
//     {node.subRight && <sub className="sub-right"><MathRenderer node={node.subRight} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></sub>}
//     {node.supRight && <sup className="sup-right"><MathRenderer node={node.supRight} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></sup>}
//   </span>
// );

// export const renderDecoratedNode = (
//   node: DecoratedNode, 
//   { cursor, onCursorChange, onRootChange }: RenderProps
// ) => (
//   <span className={`math-node type-decorated ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
//     <span className={`decoration ${node.decoration}`}>
//       <MathRenderer node={node.base} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} />
//     </span>
//   </span>
// );

// Continue adding render functions for other node types (BigOperator, Vector, etc.)
