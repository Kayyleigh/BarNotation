import React from "react";
import { StyledNode, MathNode, TextStyle } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";

export const StyledNodeRenderer: React.FC<CoreRenderProps<StyledNode>> = ({ node, ...baseProps }) => {
  const combinedStyle: TextStyle = {
    ...baseProps.inheritedStyle,
    ...node.style,
  };

  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    inheritedStyle: combinedStyle,
    index,
  });

  return (
    <MathNodeWrapper node={node} {...baseProps} className="type-styled">
      <MathRenderer {...getChildProps(node.child, 0)} />
    </MathNodeWrapper>
  );
};
