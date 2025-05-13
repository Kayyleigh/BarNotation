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

const nodeClass = (node: MathNode, selectedId: string | null) =>
  clsx('math-node', `type-${node.type}`, { selected: node.id === selectedId });


export const renderTextNode = (
  node: TextNode,
  selectedId: string | null,
  onSelect: (id: string) => void,
  onChange: (newRoot: MathNode) => void
) => {
  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const newText = e.currentTarget.textContent ?? "";
    onChange({ ...node, content: newText });
  };

  return (
    <span
      className={clsx("math-node", "type-text", { selected: node.id === selectedId })}
      onClick={(e) => {
          e.stopPropagation()
          onSelect(node.id)
        }
      }
      onInput={handleInput}
    >
      {node.content}
    </span>
  );
};

// export const renderTextNode = (
//   node: TextNode,
//   selection: { id: string; offset: number } | null,
//   onSelect: (id: string, offset: number) => void
// ) => {
//   const chars = node.content.split('');
//   const caretPos = selection?.id === node.id ? selection.offset : null;

//   return (
//     <span
//       className="text-node"
//       onClick={(e) => {
//         // Compute clicked offset from mouse position if desired
//         onSelect(node.id, node.content.length); // crude version
//       }}
//     >
//       {chars.map((char, index) => (
//         <span key={index}>
//           {caretPos === index && <span className="caret">|</span>}
//           {char}
//         </span>
//       ))}
//       {caretPos === chars.length && <span className="caret">|</span>}
//     </span>
//   );
// };

export const renderInlineContainerNode = (node: InlineContainerNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => (
  <span 
    className={nodeClass(node, selectedId)} 
    onClick={() => onSelect(node.id)}
  >
    {node.children.map(child => (
      <MathRenderer 
        key={child.id} 
        node={child} 
        selectedId={selectedId} 
        onSelect={onSelect} 
        onRootChange={onRootChange} 
      />
    ))}
  </span>
);

export const renderGroupNode = (node: GroupNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => (
  <span className={`math-node type-group ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
    {node.showBrackets && <span className="bracket">(</span>}
    {node.children.map(child => (
      <MathRenderer 
        key={child.id} 
        node={child} 
        selectedId={selectedId} 
        onSelect={onSelect} 
        onRootChange={onRootChange} 
      />
    ))}
    {node.showBrackets && <span className="bracket">)</span>}
  </span>
);

export const renderFractionNode = (node: FractionNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => (
  <span className={`math-node type-fraction ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
    <div className="fraction">
      <div className="numerator">
        <MathRenderer 
          node={node.numerator} 
          selectedId={selectedId} 
          onSelect={onSelect} 
          onRootChange={onRootChange} 
        />
      </div>
      <hr />
      <div className="denominator">
        <MathRenderer 
          node={node.denominator} 
          selectedId={selectedId} 
          onSelect={onSelect} 
          onRootChange={onRootChange} 
        />
      </div>
    </div>
  </span>
);

export const renderRootNode = (node: RootNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => (
  <span className={`math-node type-root ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
    <span className="root">
      {node.degree && <MathRenderer node={node.degree} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} />}
      <span className="radical">√</span>
      <MathRenderer node={node.radicand} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} />
    </span>
  </span>
);

export const renderBigOperatorNode = (node: BigOperatorNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => (
  <span className={`math-node type-bigoperator ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
    <span className="big-op">{node.operator}</span>
    {node.lowerLimit && <div className="sub"><MathRenderer node={node.lowerLimit} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></div>}
    {node.upperLimit && <div className="sup"><MathRenderer node={node.upperLimit} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></div>}
    <MathRenderer node={node.body} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} />
  </span>
);

export const renderSubSuperscriptNode = (node: SubSuperscriptNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => (
  <span className={`math-node type-subsuperscript ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
    <span className="base"><MathRenderer node={node.base} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></span>
    {node.subLeft && <sub className="sub-left"><MathRenderer node={node.subLeft} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></sub>}
    {node.supLeft && <sup className="sup-left"><MathRenderer node={node.supLeft} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></sup>}
    {node.subRight && <sub className="sub-right"><MathRenderer node={node.subRight} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></sub>}
    {node.supRight && <sup className="sup-right"><MathRenderer node={node.supRight} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></sup>}
  </span>
);

export const renderDecoratedNode = (node: DecoratedNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => (
  <span className={`math-node type-decorated ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
    <span className={`decoration ${node.decoration}`}>
      <MathRenderer node={node.base} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} />
    </span>
  </span>
);

export const renderVectorNode = (node: VectorNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => {
  const isVertical = node.orientation === "vertical";
  return (
    <span className={`math-node type-vector ${node.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(node.id)}>
      {isVertical ? (
        <table><tbody>{node.items.map(n => (
          <tr key={n.id}><td><MathRenderer node={n} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></td></tr>
        ))}</tbody></table>
      ) : (
        <span className="horizontal-vector">{node.items.map(n => (
          <MathRenderer key={n.id} node={n} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} />
        ))}</span>
      )}
    </span>
  );
};

// For complex nodes like MatrixNode:
export const renderMatrixNode = (node: MatrixNode, selectedId: string | null, onSelect: (id: string) => void, onRootChange: (newRoot: MathNode) => void) => (
  <table className={nodeClass(node, selectedId)} onClick={() => onSelect(node.id)}>
    <tbody>
      {node.rows.map((row, i) => (
        <tr key={i}>
          {row.map(cell => (
            <td key={cell.id}><MathRenderer node={cell} selectedId={selectedId} onSelect={onSelect} onRootChange={onRootChange} /></td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

// Continue adding render functions for other node types (BigOperator, Vector, etc.)
