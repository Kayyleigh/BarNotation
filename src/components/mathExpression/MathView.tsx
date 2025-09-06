// components/mathExpression/MathView.tsx
import React from "react";
import type { MathNode } from "../../models/mathNodeTypes";
import { ReadOnlyMathRenderer } from "./MathRenderer";
import { dummyCursorPosition } from "../../logic/cursor";
import { noop } from "../../utils/noop";

type MathViewProps = {
  node: MathNode;
  className?: string;
  showPlaceHolder?: boolean;
};

const MathView: React.FC<MathViewProps> = ({ node, className, showPlaceHolder }) => {
  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <ReadOnlyMathRenderer
        node={node}
        cellId={"readonly"} // dummy value
        containerId={"readonly-container"}
        index={0}
        isActive={false}
        cursor={dummyCursorPosition}
        hoverPath={[]}
        onCursorChange={noop}
        setHoverPath={noop}
        onDropNode={noop}
        // editorState={} //TODO make dummy
        updateEditorState={noop}
        ancestorIds={[]}
        inheritedStyle={{
          fontStyling: { fontStyle: "normal", fontStyleAlias: "" },
        }}
        showPlaceholder={showPlaceHolder}
        readOnly={true}
      />
    </div>
  );
};

export default React.memo(MathView);