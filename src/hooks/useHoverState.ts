// hooks/useHoverState.ts
import { useState } from "react";

export const useHoverState = () => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | undefined>(undefined);

  return {
    hoveredNodeId,
    setHoveredNodeId,
  };
};
