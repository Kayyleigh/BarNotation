// components/mathExpression/shared/MathNodeWrapper.tsx
import React from "react";
import { MathNode } from "../../../models/mathNodeTypes";
import { getIsHovered } from "../../../utils/mathHoverUtils";
import { CoreRenderProps } from "../MathRenderer";
import { attachHoverHandlers } from "./hoverHandlers";
import { getStyleClass, getInlineStyle } from "./styleUtils";
import clsx from "clsx";
import { useMathDrag } from "./useMathDrag";

interface MathNodeWrapperProps<TNode extends MathNode> extends CoreRenderProps<TNode> {
  className?: string;
  children?: React.ReactNode;
}

export function MathNodeWrapper<TNode extends MathNode>({
  node,
  className,
  children,
  ...baseProps
}: MathNodeWrapperProps<TNode>) {
  const { drag, isDropTarget } = useMathDrag({ ...baseProps, node });
  const styleClass = getStyleClass(baseProps.inheritedStyle);
  const isHovered = getIsHovered(node, baseProps.hoverPath);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only set cursor if the node is inside an active container
    const { containerId, index, onCursorChange, focusEditor } = baseProps;
    if (containerId != null && onCursorChange) {
      onCursorChange({ containerId, index: index + 1 });
      requestAnimationFrame(() => focusEditor());
    }
  };

  return (
    <>
      <span
        {...drag}
        data-nodeid={node.id}
        className={clsx("math-node", className, styleClass, {
          hovered: isHovered,
          "drop-target": isDropTarget,
        })}
        style={{
          ...getInlineStyle(baseProps.inheritedStyle),
        }}
        // style={getInlineStyle(baseProps.inheritedStyle)}
        onClick={handleClick}
        {...attachHoverHandlers(node, baseProps.ancestorIds, baseProps.setHoverPath)}
      >
        {children}
      </span>
    </>
  );
}
