import React from "react";
import {
  createTextNode,
  createFraction,
  createBigOperator,
  createGroupNode,
  createNthRoot,
  createChildedNode,
} from "../models/nodeFactories";
import type { MathNode } from "../models/types";

type ToolbarProps = {
  onAddNode: (node: MathNode) => void;
};

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode }) => (
  <div className="toolbar">
    <button onClick={() => onAddNode(createTextNode("x"))}>Text</button>
    <button onClick={() => onAddNode(createFraction())}>Fraction</button>
    <button onClick={() => onAddNode(createNthRoot())}>Root</button>
    <button onClick={() => onAddNode(createBigOperator())}>BigOp</button>
    <button onClick={() => onAddNode(createChildedNode())}>Sub/Sup</button>
    <button onClick={() => onAddNode(createGroupNode())}>Group</button>
  </div>
);

export default Toolbar;
