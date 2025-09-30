import React from "react";
import { FractionNode, MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";

export const FractionNodeRenderer: React.FC<CoreRenderProps<FractionNode>> = (props) => {
  const { node, ...baseProps } = props;

  const renderChild = (child: MathNode, index: number) => (
    <MathRenderer {...baseProps} node={child} containerId={child.id} index={index} />
  );

  // detect integral operators
  const isBinom = node.variant === "binom";

  return (
    <MathNodeWrapper node={node} {...baseProps} className={`type-fraction ${isBinom ? "binom" : ""}`}>
      {isBinom && <span className="binom-bracket left">(</span>}
      <span className="fraction">
        <span className="numerator">{renderChild(node.numerator, 0)}</span>
        {node.variant === "frac" && <div className="line" />}
        <span className="denominator">{renderChild(node.denominator, 1)}</span>
      </span>
      {isBinom && <span className="binom-bracket right">)</span>}
    </MathNodeWrapper>
  );
};
