import React from "react";
import { MultiDigitNode, MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";
import { renderContainerChildren } from "../shared/renderContainerChildren";

export const MultiDigitNodeRenderer: React.FC<CoreRenderProps<MultiDigitNode>> = ({
  node,
  ...baseProps
}) => {
  return (
    <MathNodeWrapper node={node} {...baseProps} className="type-multidigit">
      {renderContainerChildren(
        node.children,
        {
          ...baseProps,
          containerId: node.id,
          inheritedStyle: {
            fontStyling: { fontStyle: "multidigit", fontStyleAlias: "" },
          },
        } as CoreRenderProps<MathNode>,
        MathRenderer
      )}
    </MathNodeWrapper>
  );
};
