// components/mathExpression/mathNodeRenderers/TextNodeRenderer.tsx
import React from "react";
import { MathNodeWrapper } from "../shared/MathNodeWrapper";
import { blackboardMap, calligraphicMap } from "../../../constants/mathStyleMaps";
import { TextNode } from "../../../models/mathNodeTypes";
import { CoreRenderProps } from "../MathRenderer";
import { isClosingBracket, isOpeningBracket } from "../../../utils/bracketUtils";

export const TextNodeRenderer: React.FC<CoreRenderProps<TextNode>> = (props) => {
  const { node, inheritedStyle } = props;

  const isBracket = isOpeningBracket(node.content) || isClosingBracket(node.content);

  let finalContent = node.content;
  const style = inheritedStyle?.fontStyling?.fontStyle;

  if (style === "calligraphic") {
    finalContent = calligraphicMap[node.content] ?? node.content;
  } else if (style === "blackboard") {
    finalContent = blackboardMap[node.content] ?? node.content;
  }

  return (
    <MathNodeWrapper {...props} className={`type-text ${isBracket ? "bracket-node" : ""}`}>
        {finalContent}
    </MathNodeWrapper>
  );
};
