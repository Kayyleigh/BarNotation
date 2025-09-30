import React from "react";
import { DecoratedNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";
import '../../../styles/accents.css'

export const DecoratedNodeRenderer: React.FC<CoreRenderProps<DecoratedNode>> = ({ node, ...baseProps }) => {

  return (
    <MathNodeWrapper
      node={node}
      {...baseProps}
      className={`type-accented decoration-${node.decoration}`}
    >
      <span className="accent-base">
        <MathRenderer
          node={node.base}
          {...baseProps}
          containerId={node.base.id}
          index={0}
        />
      </span>
    </MathNodeWrapper>
  );
};
