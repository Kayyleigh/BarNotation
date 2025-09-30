import { MathNode } from "../../../models/mathNodeTypes";
import { handleMouseEnter, handleMouseLeave } from "../../../utils/mathHoverUtils";

export function attachHoverHandlers(node: MathNode, ancestorIds: string[], setHoverPath: (path: string[]) => void) {
  return {
    onMouseEnter: () => handleMouseEnter([...ancestorIds], setHoverPath),
    onMouseLeave: (e: React.MouseEvent) => handleMouseLeave(e, ancestorIds, setHoverPath),
  };
}
