import React from "react";
import {
  createTextNode,
  createFraction,
  createRoot,
  createBigOperator,
  createSubSup,
  createDecorated,
  createMatrix,
  createVector,
  createGroupNode
} from "../models/nodeFactories";
import type { MathNode } from "../models/types";

type ToolbarProps = {
  onAddNode: (node: MathNode) => void;
};

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode }) => (
  <div className="toolbar">
    <button onClick={() => onAddNode(createTextNode("x"))}>Text</button>
    <button onClick={() => onAddNode(createFraction())}>Fraction</button>
    <button onClick={() => onAddNode(createRoot())}>Root</button>
    <button onClick={() => onAddNode(createBigOperator())}>BigOp</button>
    <button onClick={() => onAddNode(createSubSup())}>Sub/Sup</button>
    <button onClick={() => onAddNode(createGroupNode())}>Group</button>
    <button onClick={() => onAddNode(createDecorated("angl"))}>Angle</button>
    <button onClick={() => onAddNode(createMatrix())}>Matrix</button>
    <button onClick={() => onAddNode(createVector("vertical"))}>Vector</button>
  </div>
);

export default Toolbar;
