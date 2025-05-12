import React, { useState } from "react";
import { MathNode, MultiCharacterNode } from "../math/types";
import { parseInputString } from "../math/parser";
import { MathNodeView } from "./MathNodeView";
import { MathToolbar } from "./MathToolbar";
import { findNodeById } from "../math/treeUtils"; // implement this


export const MathCanvas: React.FC = () => {
  const [input, setInput] = useState("");
  const [tree, setTree] = useState<MathNode>(new MultiCharacterNode(""));
  const [selectedNode, setSelectedNode] = useState<MathNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<MathNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MathNode | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const nodeId = el?.closest("[data-nodeid]")?.getAttribute("data-nodeid");
    if (!nodeId) return setHoveredNode(null);

    const found = findNodeById(tree, nodeId);
    setHoveredNode(found ?? null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    const parsed = parseInputString(newInput);
    setTree(parsed);
    setSelectedNode(null);
  };

  const handleInsert = (newNode: MathNode) => {
    if (!selectedNode) {
      // If no node is selected, replace whole tree (fallback)
      setTree(newNode);
      return;
    }

    // Replace selected node with new node
    const replaceInTree = (current: MathNode): MathNode => {
      if (current === selectedNode) {
        return newNode;
      }

      const updated = current.cloneWithChildren?.(
        current.children.map(replaceInTree)
      );

      return updated ?? current;
    };

    setTree(replaceInTree(tree));
    setSelectedNode(newNode);
  };

  return (
    <div className="math-canvas" style={{ padding: "20px" }}>
      <MathToolbar onInsert={handleInsert} />
      <h2>Math Notation Canvas</h2>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Type math (e.g., x^2, a/b)"
        style={{ width: "100%", fontSize: "18px", padding: "1em" }}
      />
      <div
        style={{ marginTop: "20px", fontSize: "40px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <MathNodeView
          node={tree}
          rootTree={tree}
          updateTree={setTree}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          draggedNode={draggedNode}
          setDraggedNode={setDraggedNode}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
        />
      </div>
    </div>
  );
};
