import React from "react";
import { ChildedNode, MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";

export const ChildedNodeRenderer: React.FC<CoreRenderProps<ChildedNode>> = ({ node, ...baseProps }) => {
  const children = [
    { className: "sup-left", node: node.supLeft },
    { className: "sub-left", node: node.subLeft },
    { className: "base", node: node.base },
    { className: "sub-right", node: node.subRight },
    { className: "sup-right", node: node.supRight },
  ];

  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index,
  });

  return (
    <MathNodeWrapper
      node={node}
      {...baseProps}
      className={`type-childed ${node.variant === "subsup" ? "type-subsup" : "type-actsymb"}`}
    >
      {children.map(({ className, node: child }, i) => (
        <span key={className} className={className}>
          <MathRenderer {...getChildProps(child, i)} />
        </span>
      ))}
    </MathNodeWrapper>
  );
};
