import React, { useState } from "react";
import type { MathNode } from "../models/types";
import Toolbar from "./Toolbar";
import { createInlineContainer } from "../models/nodeFactories";
import { MathRenderer } from "./MathRenderer";

const Editor: React.FC = () => {
  const [root, setRoot] = useState<MathNode>(createInlineContainer());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAddNode = (node: MathNode) => {
    if (root.type === "inline-container") {
      root.children.push(node);
      setRoot({ ...root });
    }
  };

  return (
    <div className="editor-container">
      <Toolbar onAddNode={handleAddNode} />
      <div className="math-editor">
        <MathRenderer node={root} selectedId={selectedId} onSelect={setSelectedId}/>
      </div>
    </div>
  );
};

export default Editor;
