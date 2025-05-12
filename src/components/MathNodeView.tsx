import React from "react";
import {
  MathNode,
  CharacterNode,
  MultiCharacterNode,
  FractionNode,
  RootNode,
  BigOperatorNode,
  MatrixNode,
  VectorNode,
  SubSupScriptedNode,
  GroupNode,
  DecoratedNode,
} from "../math/types";
import { handleShortcuts } from "../math/shortcuts";
import { deepReplaceNode, deserializeMathNode } from "../math/treeUtils";
import { escapeOneLevel } from "../utils/treeNavigation";
//import "../styles/ActuarialNode.css"; // Ensure this is correctly linked

interface MathNodeViewProps {
  node: MathNode;
  rootTree: MathNode;
  updateTree: (newTree: MathNode) => void;
  selectedNode: MathNode | null;
  onSelectNode: (node: MathNode) => void;
  draggedNode?: MathNode | null;
  setDraggedNode?: (node: MathNode | null) => void;
  hoveredNode?: MathNode | null;
  setHoveredNode?: (node: MathNode | null) => void;
}

export const MathNodeView: React.FC<MathNodeViewProps> = ({
  node,
  rootTree,
  updateTree,
  selectedNode,
  onSelectNode,
  draggedNode,
  setDraggedNode,
  hoveredNode,
}) => {

  const isSelected = node === selectedNode;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(node);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.dataTransfer.getData("application/json");
    const raw = JSON.parse(data);
    const newNode = deserializeMathNode(raw);
    const updatedTree = deepReplaceNode(rootTree, node.id, newNode);
    updateTree(updatedTree);
    onSelectNode(newNode);
    setDraggedNode?.(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/json", JSON.stringify(node));
    setDraggedNode?.(node);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  };

  const isDescendantOf = (root: MathNode, possibleDescendant: MathNode): boolean => {
    if (root === possibleDescendant) return false; // A node is not a descendant of itself
    for (const child of root.children) {
      if (child === possibleDescendant || isDescendantOf(child, possibleDescendant)) {
        return true;
      }
    }
    return false;
  }

  // Highlight logic
  const isUnderHover = hoveredNode === node;
  const isDescendant = hoveredNode && isDescendantOf(hoveredNode, node);
  const isLeaf = node.children.length === 0;
  const highlightLeaf = isDescendant && isLeaf;

  const baseStyle: React.CSSProperties = {
    padding: "2px 2px",
    margin: "1px",
    border: isSelected ? "2px solid #007acc" : "1px rgba(188, 216, 188, 0.3)",
    backgroundColor: isUnderHover
    ? "rgba(255, 255, 0, 0.3)"
    : highlightLeaf
    ? "rgba(0, 255, 0, 0.3)"
    : "transparent",
    borderRadius: "4px",
    cursor: "pointer",
    userSelect: "none",
    //display: "inline-block",
  };

  const decoStyle: React.CSSProperties = {
    color: isUnderHover
    ? "rgb(0, 169, 0)"
    : isDescendant
    ? "rgb(180, 177, 0)"
    : "black",
  };

  // Editable TextNode
  if (node instanceof CharacterNode) {
    return (
      <span
        data-nodeid={node.id}
        draggable
        onDragStart={handleDragStart}
        style={baseStyle}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          className="math-input"
          value={node.value}
          onChange={(e) => {
            if (e.target.value.length > 1) {
              const updatedNode = new MultiCharacterNode(e.target.value);
              const updatedTree = deepReplaceNode(rootTree, node.id, updatedNode);
              updateTree(updatedTree);
            } else {
              console.log(`${e.target.value} is not long one`)
              const updatedNode = new CharacterNode(e.target.value);
              const updatedTree = deepReplaceNode(rootTree, node.id, updatedNode);
              updateTree(updatedTree);
            }              
          }}
          //onKeyDown={(e) => handleShortcuts(e, node, rootTree, updateTree)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              escapeOneLevel("left", rootTree, node.id, updateTree);
            } else if (e.key === "ArrowRight") {
              escapeOneLevel("right", rootTree, node.id, updateTree);
            } else {
              handleShortcuts(e, node, rootTree, updateTree);
            }
          }}
          
          style={{ border: "none", background: "transparent", width: "auto" }}
        />
      </span>
    );
  }

  // Recursive rendering helper
  const renderChild = (child?: MathNode) => {
    if (!child) return null;
    return (
      <MathNodeView
        key={child.id}
        node={child}
        rootTree={rootTree}
        updateTree={updateTree}
        selectedNode={selectedNode}
        onSelectNode={onSelectNode}
        hoveredNode={hoveredNode}
      />
    );
  };

  if (node instanceof MultiCharacterNode) {
    return (
      <span className="multi-char-node"
        data-nodeid={node.id}
        draggable 
        onDragStart={handleDragStart} 
        onClick={handleClick} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={baseStyle}
      >
        {node.items.map(renderChild)}
      </span>
    );
  }

  if (node instanceof RootNode) {
    return (
      <span className="root-node"
        data-nodeid={node.id}
        draggable 
        onDragStart={handleDragStart} 
        onClick={handleClick} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={baseStyle}
      >
        {node.index && <span className="root-index">{renderChild(node.index)}</span>}
        <span className="radical-symbol">√</span>
        <span className="radicand">{renderChild(node.radicand)}</span>
      </span>
    );
  }

  if (node instanceof BigOperatorNode) {
    return (
      <span className="big-operator-node"
        data-nodeid={node.id}
        draggable 
        onDragStart={handleDragStart} 
        onClick={handleClick} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={{ ...baseStyle, display: "flex", flexDirection: "row" }}
      >
        <div className="operator-symbol">{node.operatorSymbol}</div>
        <div className="limits">
          <div className="upper-limit">{node.upper && renderChild(node.upper)}</div>
          <div className="lower-limit">{node.lower && renderChild(node.lower)}</div>
        </div>
        <div className="operator-body">{renderChild(node.body)}</div>
      </span>
    );
  }

  if (node instanceof MatrixNode) {
    return (
      <span className="matrix-node"
        data-nodeid={node.id}
        draggable 
        onDragStart={handleDragStart} 
        onClick={handleClick} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={baseStyle}
      >
        <table className="matrix-table">
        <tbody>
          {node.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex}>{renderChild(cell)}</td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </span>
    );
  }

  if (node instanceof VectorNode) {
    return (
      <span className="vector-node"
        data-nodeid={node.id}
        draggable 
        onDragStart={handleDragStart} 
        onClick={handleClick} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={baseStyle}
      >
        <table className="vector-table">
          <tbody>
            {node.orientation === "column"
              ? node.elements.map((el, i) => (
                  <tr key={i}><td>{renderChild(el)}</td></tr>
                ))
              : (
                  <tr>
                    {node.elements.map((el, i) => (
                      <td key={i}>{renderChild(el)}</td>
                    ))}
                  </tr>
                )
            }
          </tbody>
        </table>
      </span>
    );
  }

  if (node instanceof DecoratedNode) {
    const decorationType = node.decoration;
  
    // Mapping from precedence number commands to rendered numbers 
    const topBottomMap = {
      itop: "1", iitop: "2", iiitop: "3",
      ibottom: "1", iibottom: "2", iiibottom: "3"
    };

    const renderOverlay = () => {
      switch (decorationType) {
        case "angl":
          return <span className="decoration-overlay decoration-angl" style={decoStyle}/>;
        case "joint":
          return <span className="decoration-overlay decoration-joint" style={decoStyle}/>;
        case "bar":
          return <span className="decoration-overlay decoration-bar" style={decoStyle}/>;
        case "hat":
          return <span className="decoration-overlay decoration-hat" style={decoStyle}>ˆ</span>;
        case "tilde":
          return <span className="decoration-overlay decoration-tilde" style={decoStyle}>~</span>;
        case "itop":
        case "iitop":
        case "iiitop":
          return (
            <span className="decoration-overlay decoration-top-number" style={decoStyle}>
              {topBottomMap[decorationType]}
            </span>
          );
        case "ibottom":
        case "iibottom":
        case "iiibottom":
          return (
            <span className="decoration-overlay decoration-bottom-number" style={decoStyle}>
              {topBottomMap[decorationType]}
            </span>
          );
        default:
          return null;
      }
    };
  
    return (
      <span
        className={`decorated-node decorated-${decorationType}`}
        data-nodeid={node.id}
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={baseStyle}
      >
        {renderOverlay()}
        <span className="decorated-child">{renderChild(node.child)}</span>
      </span>
    );
  }

  if (node instanceof GroupNode) {
    return (
      <span className="group-node"
        data-nodeid={node.id}
        draggable 
        onDragStart={handleDragStart} 
        onClick={handleClick} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={baseStyle}
      >
        <span className="group-left">(</span>
        <span className="group-content">
          {node.groupChildren.map(renderChild)}
        </span>
        <span className="group-right">)</span>
      </span>
    );
  }

  if (node instanceof FractionNode) {
    return (
      <span className="math-frac"
        data-nodeid={node.id}
        draggable 
        onDragStart={handleDragStart} 
        onClick={handleClick} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={baseStyle}
      >
        <div className="frac-num">{renderChild(node.numerator)}</div>
        <hr />
        <div className="frac-den">{renderChild(node.denominator)}</div>
      </span>
    );
  }

  if (node instanceof SubSupScriptedNode) {
    return (
      <span className="actuarial-node"
        data-nodeid={node.id}
        draggable 
        onDragStart={handleDragStart} 
        onClick={handleClick} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={baseStyle}
      >
        <div className="corner-wrapper bottom-left">{renderChild(node.ll)}</div>
        <div className="corner-wrapper top-left">{renderChild(node.ul)}</div>
        <div className="base">{renderChild(node.base)}</div>
        <div className="corner-wrapper bottom-right">{renderChild(node.lr)}</div>
        <div className="corner-wrapper top-right">{renderChild(node.ur)}</div>
      </span>
    );
  }

  return (
    <span style={{ ...baseStyle, color: "red" }} onClick={handleClick}>
      Unknown node type
    </span>
  );
};
