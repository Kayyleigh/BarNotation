// components/mathExpression/mathNodeRenderers/RootWrapperNodeRenderer.tsx
import React from "react";
import { RootWrapperNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";

export const RootWrapperNodeRenderer: React.FC<CoreRenderProps<RootWrapperNode>> = ({
  node,
  ...baseProps
}) => {
  return (
      <MathRenderer
        {...baseProps}
        node={node.child}
        containerId={node.child.id}
        index={0}
      />
  );
};
