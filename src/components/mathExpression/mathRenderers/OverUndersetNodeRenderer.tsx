import React from "react";
import { OverUndersetNode, MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";

export const OverUndersetNodeRenderer: React.FC<CoreRenderProps<OverUndersetNode>> = ({
  node,
  ...baseProps
}) => {

  const getChildProps = (childNode: MathNode) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index: 0,
  });

  return (
    <MathNodeWrapper node={node} {...baseProps} className="type-accented">
      {node.position === "above" && (
        <div className={`accent-above ${node.variant}`}>
          <MathRenderer {...getChildProps(node.content)} />
        </div>
      )}

      <span className="accent-base">
        <MathRenderer {...getChildProps(node.base)} />
      </span>

      {node.position === "below" && (
        <div className={`accent-below ${node.variant}`}>
          <MathRenderer {...getChildProps(node.content)} />
        </div>
      )}
    </MathNodeWrapper>
  );
};
