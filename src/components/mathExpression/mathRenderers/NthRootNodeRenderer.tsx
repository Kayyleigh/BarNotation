import React from "react";
import { NthRootNode, MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";

export const NthRootNodeRenderer: React.FC<CoreRenderProps<NthRootNode>> = ({ node, ...baseProps }) => {
  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index,
  });

  return (
    <MathNodeWrapper node={node} {...baseProps} className="type-nth-root">
      <span className="nth-root-wrapper">
        <span className="nth-index">
          <MathRenderer {...getChildProps(node.index, 0)} />
        </span>
        <span className="radical-symbol" />
        <span className="radicand">
          <MathRenderer {...getChildProps(node.base, 1)} />
        </span>
      </span>
    </MathNodeWrapper>
  );
};
