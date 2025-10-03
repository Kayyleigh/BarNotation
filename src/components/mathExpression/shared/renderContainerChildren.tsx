
import { MathNode } from "../../../models/mathNodeTypes";
import DummyStartNodeRenderer from "../DummyStartNodeRenderer";
import { CoreRenderProps } from "../MathRenderer";

/**
 * Recursively renders children of a container node,
 * including cursor, hover, and placeholder handling.
 */
export function renderContainerChildren(
  children: MathNode[],
  baseProps: CoreRenderProps,
  Renderer: React.FC<CoreRenderProps>
): React.ReactNode[] {
  const {
    cursor,
    containerId,
    isActive,
    readOnly,
    cellId
  } = baseProps;

  const nodes: React.ReactNode[] = [];

  // if (!readOnly) {
  //   nodes.push(
  //     <DummyStartNodeRenderer
  //       key={`start-point-${containerId}`}
  //       {...baseProps}
  //       containerId={containerId}
  //       cellId={cellId}
  //     />
  //   );
  // }

    if (!readOnly && children.length === 0) {
    nodes.push(
      <DummyStartNodeRenderer
        key={`start-point-${containerId}`}
        {...baseProps}
        containerId={containerId}
        cellId={cellId}
      />
    );
  }

  for (let i = 0; i <= children.length; i++) {
    if (isActive && cursor.containerId === containerId && cursor.index === i) {
      nodes.push(<span key={`cursor-${i}`} className="cursor" />);
    }

    if (i < children.length) {
      const child = children[i];

      nodes.push(
        <Renderer
          key={child.id}
          {...baseProps}
          node={child}
          containerId={containerId}
          index={i}
        />
      );
    }
  }

  return nodes;
}
