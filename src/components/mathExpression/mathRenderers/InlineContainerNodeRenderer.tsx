import React from "react";
import { InlineContainerNode, MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";
import { renderContainerChildren } from "../shared/renderContainerChildren";

export const InlineContainerNodeRenderer: React.FC<CoreRenderProps<InlineContainerNode>> = ({
  node,
  ...baseProps
}) => {
  return (
    <MathNodeWrapper node={node} {...baseProps} className="type-inline-container">
      {node.children.length < 1 && baseProps.showPlaceholder ? (
        <span className="placeholder-square">⬚</span>
      ) : (
        renderContainerChildren(
          node.children,
          { ...baseProps, containerId: node.id } as CoreRenderProps<MathNode>,
          MathRenderer
        )
      )}
    </MathNodeWrapper>
  );
};
