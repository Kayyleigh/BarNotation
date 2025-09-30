import React from "react";
import { BigOperatorNode, MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";

export const BigOperatorNodeRenderer: React.FC<CoreRenderProps<BigOperatorNode>> = (props) => {
  const { node, ...baseProps } = props;

  const renderChild = (child: MathNode, index: number) => (
    <MathRenderer {...baseProps} node={child} containerId={child.id} index={index} />
  );

  // detect integral operators
  const isIntegral = ["∫", "∬", "∭", "⨌", "∮"].includes(node.operator);

  return (
    <MathNodeWrapper node={node} {...baseProps} className={`type-big-operator ${isIntegral ? "integral" : ""}`}>
      <div className="big-operator-wrapper">
        <div className="big-operator-upper">{renderChild(node.upper, 0)}</div>
        <div className="big-operator-symbol">{node.operator}</div>
        <div className="big-operator-lower">{renderChild(node.lower, 1)}</div>
      </div>
    </MathNodeWrapper>
  );
};
