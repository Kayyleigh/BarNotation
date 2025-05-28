// MathRenderers.tsx

import React from 'react';
import { MathRenderer } from './MathRenderer';
import type { 
    MathNode, 
    TextNode, 
    InlineContainerNode, 
    GroupNode, 
    FractionNode,
    ChildedNode,
    AccentedNode,
    StyledNode,
    TextStyle,
    MultiDigitNode,
    CommandInputNode,
    BigOperatorNode,
    RootWrapperNode, 
} from '../models/types';
import clsx from 'clsx';
import type { CursorPosition } from '../logic/cursor';
import '../styles/math-node.css' 
import '../styles/accents.css' 
import { getCloseSymbol, getOpenSymbol, isClosingBracket, isOpeningBracket } from '../utils/bracketUtils';


type RenderProps = {
  cursor: CursorPosition;
  onCursorChange: (cursor: CursorPosition) => void;
  onRootChange: (newRoot: MathNode) => void;
  parentContainerId?: string;
  index?: number;

  inheritedStyle?: TextStyle;

};

export const renderRootWrapperNode = (
  node: RootWrapperNode,
  props: RenderProps
) => {
  // Root wrapper is just a container for one child, no cursor logic here
  const child = node.child;

  if (!child) {
    // If no child, render empty placeholder or nothing
    return <span className="math-node root-wrapper-empty" />;
  }

  return (
    <span className="math-node root-wrapper">
      <MathRenderer
        node={child}
        cursor={props.cursor}
        onCursorChange={props.onCursorChange}
        onRootChange={props.onRootChange}
        parentContainerId={node.id}
        index={0} // Since root wrapper is not navigable, index can be 0 or ignored
        inheritedStyle={props.inheritedStyle}
      />
    </span>
  );
};

export const renderStyledNode = (node: StyledNode, props: RenderProps) => {
  const mergedStyle: TextStyle = {
    ...props.inheritedStyle,
    ...node.style,
  };

  return (
    <span className={getStyleClass(mergedStyle)} style={getInlineStyle(mergedStyle)}>
      <MathRenderer
        node={node.child}
        {...props}
        inheritedStyle={mergedStyle}
      />
    </span>
  );
};

export const renderTextNode = (
  node: TextNode,
  { cursor, onCursorChange, parentContainerId, index, inheritedStyle }: RenderProps
) => {
  const isSelected = cursor.containerId === node.id;

  const className = clsx(
    "math-node",
    "type-text",
    { selected: isSelected },
    { "bracket-node": isOpeningBracket(node.content) || isClosingBracket(node.content) },
    getStyleClass(inheritedStyle)
  );

  const style = getInlineStyle(inheritedStyle);  

  return (
    <span
      className={className} 
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        if (parentContainerId && index) {
          // Set cursor to position after this node in the parent container
          onCursorChange({
            containerId: parentContainerId,
            index: index, // placeholder, should be actual index
          });
        }
      }}
    >
      {node.content}
    </span>
  );
};

export const renderMultiDigitNode = (
  node: MultiDigitNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange } = props;
  const isCursorInThisContainer = cursor.containerId === node.id;

  return (
    <span
      className={clsx("math-node", "type-multi-digit")}
      onClick={(e) => {
        e.stopPropagation();
        if (node.children.length === 0) {
          onCursorChange({ containerId: node.id, index: 0 });
        }
      }}
    >
      {node.children.map((child, i) => {
        const elements: React.ReactNode[] = [];

        if (isCursorInThisContainer && cursor.index === i) {
          elements.push(<span key={`cursor-${i}`} className="cursor" />);
        }

        elements.push(
          <MathRenderer
            key={child.id}
            node={child}
            cursor={cursor}
            onCursorChange={onCursorChange}
            onRootChange={props.onRootChange}
            parentContainerId={node.id}
            index={i + 1}
            inheritedStyle={props.inheritedStyle}
          />
        );

        return elements;
      })}

      {isCursorInThisContainer && cursor.index === node.children.length && (
        <span className="cursor" />
      )}
    </span>
  );
};

export const renderCommandInputNode = (
  node: CommandInputNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange } = props;
  const isCursorInThisContainer = cursor.containerId === node.id;

  return (
    <span
      className={clsx("math-node", "type-command-input", "font-mono", "text-gray-600")}
      onClick={(e) => {
        e.stopPropagation();
        if (node.children.length === 0) {
          onCursorChange({ containerId: node.id, index: 0 });
        }
      }}
    >
      {node.children.map((child, i) => {
        const elements: React.ReactNode[] = [];

        if (isCursorInThisContainer && cursor.index === i) {
          elements.push(<span key={`cursor-${i}`} className="cursor" />);
        }

        elements.push(
          <MathRenderer
            key={child.id}
            node={child}
            cursor={cursor}
            onCursorChange={onCursorChange}
            onRootChange={props.onRootChange}
            parentContainerId={node.id}
            index={i + 1}
            inheritedStyle={{fontFamily: 'command'}}
          />
        );

        return elements;
      })}

      {isCursorInThisContainer && cursor.index === node.children.length && (
        <span className="cursor" />
      )}
    </span>
  );
};


export const renderInlineContainerNode = (
  node: InlineContainerNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange } = props;

  const isCursorInThisContainer = cursor.containerId === node.id;

  return (
    <span
      className={clsx("math-node", "type-inline-container")}
      onClick={(e) => {
        e.stopPropagation();
        if (node.children.length === 0) {
          onCursorChange({ containerId: node.id, index: 0, });
        }
      }}
    >
      {node.children.map((child, i) => {
        const elements: React.ReactNode[] = [];

        // Render cursor before this child if applicable
        if (isCursorInThisContainer && cursor.index === i) {
          elements.push(<span key={`cursor-${i}`} className="cursor" />);
        }

        // Render the child itself
        elements.push(
          <MathRenderer
            key={child.id}
            node={child}
            cursor={cursor}
            onCursorChange={onCursorChange}
            onRootChange={props.onRootChange}
            parentContainerId={node.id}
            index={i + 1}
            inheritedStyle={props.inheritedStyle}
          />
        );

        return elements;
      })}

      {/* Cursor at the end of the container */}
      {isCursorInThisContainer && cursor.index === node.children.length && (
        <span className="cursor" />
      )}
    </span>
  );
};

export const renderFractionNode = (
  node: FractionNode,
  props: RenderProps
) => (
  <span className={clsx("math-node", "type-fraction")}>
    <div className="fraction">
      <div className="numerator">
        <MathRenderer node={node.numerator} {...props} />
      </div>
      <hr />
      <div className="denominator">
        <MathRenderer node={node.denominator} {...props} />
      </div>
    </div>
  </span>
);

export const renderGroupNode = (
  node: GroupNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange, onRootChange } = props;
  const isCursorInGroup = cursor.containerId === node.child.id;

  // Render cursor inside group's inline container before child i if cursor.index === i
  return (
    <span className={clsx("math-node", "type-group", `bracket-${node.bracketStyle}`)}>
      <span className="bracket bracket-open">{getOpenSymbol(node.bracketStyle)}</span>

      <span
        className="group-contents"
        onClick={e => {
          e.stopPropagation();
          // If group contents empty, place cursor at start
          if (node.child.children.length === 0) {
            onCursorChange({ containerId: node.child.id, index: 0, });
          }
        }}
      >
        {node.child.children.map((child, i) => {
          const elements: React.ReactNode[] = [];

          if (isCursorInGroup && cursor.index === i) {
            elements.push(<span key={`cursor-${i}`} className="cursor" />);
          }

          elements.push(
            <MathRenderer
              key={child.id}
              node={child}
              cursor={cursor}
              onCursorChange={onCursorChange}
              onRootChange={onRootChange}
              parentContainerId={node.child.id}
              index={i + 1}
            />
          );

          return elements;
        })}

        {isCursorInGroup && cursor.index === node.child.children.length && (
          <span className="cursor" />
        )}
      </span>

      <span className="bracket bracket-close">{getCloseSymbol(node.bracketStyle)}</span>
    </span>
  );
};

export const renderChildedNode = (
  node: ChildedNode,
  props: RenderProps
) => {
  return (
    <span 
      className={clsx("math-node", "type-childed", node.variant === 'subsup' ? "type-subsup" : "type-actsymb")}  
    >
      {/* Superscript left */}
      <span className="sup-left">
        <MathRenderer node={node.supLeft} {...props} />
      </span>

      {/* Subscript left */}
      <span className="sub-left">
        <MathRenderer node={node.subLeft} {...props} />
      </span>

      {/* Base */}
      <span className="base">
        <MathRenderer node={node.base} {...props} />
      </span>

      {/* Subscript right */}
      <span className="sub-right">
        <MathRenderer node={node.subRight} {...props} />
      </span>

      {/* Superscript right */}
      <span className="sup-right">
        <MathRenderer node={node.supRight} {...props} />
      </span>
    </span>
  );
};

export const renderAccentedNode = (
  node: AccentedNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange, onRootChange } = props;

  const renderBaseChildren = () => <MathRenderer node={node.base} {...props} />


  // const renderBaseChildren = () =>
  //   node.base.children.map((child, i) => {
  //     const elements: React.ReactNode[] = [];

  //     if (isCursorInside && cursor.index === i) {
  //       elements.push(<span key={`cursor-${i}`} className="cursor" />);
  //     }

  //     elements.push(
  //       <MathRenderer
  //         key={child.id}
  //         node={child}
  //         cursor={cursor}
  //         onCursorChange={onCursorChange}
  //         onRootChange={onRootChange}
  //         parentContainerId={node.base.id}
  //         index={i + 1}
  //       />
  //     );

  //     return elements;
  //   });

  const renderCustomAccent = (position: "above" | "below") => {
    return (
      <div className={`accent-content accent-${position}`}>
        <MathRenderer
          node={node.accent.content}
          cursor={cursor}
          onCursorChange={onCursorChange}
          onRootChange={onRootChange}
          parentContainerId={node.accent.content.id}
          index={0}
        />
      </div>
    );
  };

  const isCustom = node.accent.type === "custom";

  return (
    <span
      className={clsx(
        "math-node decorated-node",
        isCustom
          ? "decoration-custom"
          : `decoration-${node.accent.name}`
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (node.base.children.length === 0) {
          onCursorChange({ containerId: node.base.id, index: 0, });
        }
      }}
    >
      {isCustom && node.accent.position === "above" && renderCustomAccent("above")}

      <span className="accent-base">{renderBaseChildren()}</span>

      {isCustom && node.accent.position === "below" && renderCustomAccent("below")}
    </span>
  );
};

export const renderBigOperatorNode = (
  node: BigOperatorNode,
  props: RenderProps
) => {
  return (
    <span className={clsx("math-node", "type-big-operator")}>
      <div className="big-operator-wrapper">
        <div className="big-operator-upper">
          <MathRenderer node={node.upper} {...props} />
        </div>
        <div className="big-operator-symbol">
          {node.operator}
        </div>
        <div className="big-operator-lower">
          <MathRenderer node={node.lower} {...props} />
        </div>
      </div>
    </span>
  );
};

export const renderNthRootNode = (
  node: NthRootNode,
  props: RenderProps
) => {
  const { cursor, onCursorChange, onRootChange, inheritedStyle } = props;

  return (
    <span className="math-node type-nth-root">
      <span className="root-wrapper">
        <span className="nth-index">
          <MathRenderer
            node={node.index}
            cursor={cursor}
            onCursorChange={onCursorChange}
            onRootChange={onRootChange}
            parentContainerId={node.id}
            index={0}
            inheritedStyle={inheritedStyle}
          />
        </span>
        <span className="radical-symbol">√</span>
        <span className="radicand">
          <MathRenderer
            node={node.base}
            cursor={cursor}
            onCursorChange={onCursorChange}
            onRootChange={onRootChange}
            parentContainerId={node.id}
            index={1}
            inheritedStyle={inheritedStyle}
          />
        </span>
      </span>
    </span>
  );
};



//renderNthRootNode(node, props);
//renderBigOperatorNode(node, props);
//renderChildedNode(node, props);
//renderAccentedNode(node, props);
//renderMatrixNode(node, props);
//renderVectorNode(node, props);
//renderBinomNode(node, props);
//renderArrowNode(node, props);
//renderCasesNode(node, props);
//renderStyledNode(node, props);
//renderMultilineNode(node, props);
//renderRootWrapperNode(node, props);

function getStyleClass(style?: TextStyle): string {
  return clsx({
    "math-style-normal": style?.fontFamily === "normal",
    "math-style-upright": style?.fontFamily === "upright",
    "math-style-command": style?.fontFamily === "command",
  });
}

function getInlineStyle(style?: TextStyle): React.CSSProperties {
  return {
    color: style?.color,
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
  };
}
