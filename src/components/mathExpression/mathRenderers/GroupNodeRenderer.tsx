import React from "react";
import { GroupNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";
import { getOpenSymbol, getCloseSymbol } from "../../../utils/bracketUtils";

export const GroupNodeRenderer: React.FC<CoreRenderProps<GroupNode>> = (props) => {
  const { node, ...baseProps } = props;

  const childProps = {
    ...baseProps,
    node: node.child,
    containerId: node.child.id,
    index: 0,
  };

  return (
    <MathNodeWrapper node={node} {...baseProps} className="type-group">
      <span className="bracket bracket-open">{getOpenSymbol(node.bracketStyle)}</span>
      <span className="group-contents">
        <MathRenderer {...childProps} />
      </span>
      <span className="bracket bracket-close">{getCloseSymbol(node.bracketStyle)}</span>
    </MathNodeWrapper>
  );
};
