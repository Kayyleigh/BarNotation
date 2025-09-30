import React from "react";
import { MatrixNode, MathNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps, MathRenderer } from "../MathRenderer";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";

export const MatrixNodeRenderer: React.FC<CoreRenderProps<MatrixNode>> = ({
  node,
  ...baseProps
}) => {
  const bracketMap: Record<MatrixNode["bracketStyle"], [string, string]> = {
    none: ["", ""],
    parenthesis: ["(", ")"],
    square: ["[", "]"],
    curly: ["{", "}"],
    vertical: ["|", "|"],
    double_vertical: ["‖", "‖"],
  };
  const [leftBracket, rightBracket] = bracketMap[node.bracketStyle] ?? ["", ""];

  const scaleY = node.rows.length * 1.35;
  const shiftY = -47.5 * (1 - 1 / scaleY);

  const getCellProps = (childNode: MathNode) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index: 0,
  });

  return (
    <MathNodeWrapper node={node} {...baseProps} className={`type-matrix bracket-${node.bracketStyle}`}>
      {leftBracket && (
        <span
          className="matrix-bracket left"
          style={{
            transform: `scale(1, ${scaleY}) translateY(${shiftY}%)`,
            transformOrigin: "top left",
          }}
        >
          {leftBracket}
        </span>
      )}

      <span
        className="matrix-content"
        style={{
          gridTemplateColumns: `repeat(${node.rows[0]?.length ?? 1}, auto)`,
        }}
      >
        {node.rows.flatMap((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <span key={`matrix-cell-${rowIdx}-${colIdx}`} className="matrix-cell">
              <MathRenderer {...getCellProps(cell)} />
            </span>
          ))
        )}
      </span>

      {rightBracket && (
        <span
          className="matrix-bracket right"
          style={{
            transform: `scale(1, ${scaleY}) translateY(${shiftY}%)`,
            transformOrigin: "top left",
          }}
        >
          {rightBracket}
        </span>
      )}
    </MathNodeWrapper>
  );
};
