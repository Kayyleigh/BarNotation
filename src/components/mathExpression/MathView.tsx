// components/MathView.tsx
import React from "react";

import type { MathNode } from "../../models/types";
import { MathRenderer } from "./MathRenderer";
import { dummyCursorPosition } from "../../logic/cursor";
import { noop } from "../../utils/noop";

type MathViewProps = {
  node: MathNode;
  className?: string;
};

const MathView: React.FC<MathViewProps> = ({ node, className }) => {
  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <MathRenderer
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
        ancestorIds={[]}
        inheritedStyle={{
          fontStyling: { fontStyle: "normal", fontStyleAlias: "" },
        }}
      />
    </div>
  );
};

export default React.memo(MathView);