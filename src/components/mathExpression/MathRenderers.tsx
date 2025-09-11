// MathRenderers.tsx
import React from "react";
import clsx from "clsx";
import type {
  TextNode,
  MultiDigitNode,
  InlineContainerNode,
  GroupNode,
  FractionNode,
  NthRootNode,
  BigOperatorNode,
  ChildedNode,
  StyledNode,
  RootWrapperNode,
  MathNode,
  TextStyle,
  DecoratedNode,
  OverUndersetNode,
  MatrixNode,
} from "../../models/mathNodeTypes";
import '../../styles/math-node.css';
import '../../styles/accents.css';
import { type CoreRenderProps } from "./MathRenderer";
import { getCloseSymbol, getOpenSymbol, isClosingBracket, isOpeningBracket } from "../../utils/bracketUtils";
import { getIsHovered, handleMouseEnter, handleMouseLeave } from "../../utils/mathHoverUtils";
import DummyStartNodeRenderer from "./DummyStartNodeRenderer";
import { blackboardMap, calligraphicMap } from "../../constants/mathStyleMaps";

// Helper to get CSS classes for font styles
function getStyleClass(style: TextStyle) {
  return clsx({
    "math-style-normal": style.fontStyling?.fontStyle === "normal",
    "math-style-upright": style.fontStyling?.fontStyle === "upright",
    "math-style-bold": style.fontStyling?.fontStyle === "bold",
    "math-style-calligraphic": style.fontStyling?.fontStyle === "calligraphic",
    "math-style-blackboard": style.fontStyling?.fontStyle === "blackboard",

    "math-style-command": style.fontStyling?.fontStyle === "command",
    "math-style-multidigit": style.fontStyling?.fontStyle === "multidigit",
  });
}

function getInlineStyle(style: TextStyle): React.CSSProperties {
  return {
    color: style.color,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
  };
}

export function renderContainerChildren(
  children: MathNode[],
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode[] {
  const {
    cursor,
    containerId,
    hoverPath,
    onCursorChange,
    setHoverPath,
    inheritedStyle,
    cellId,
    isActive,
    onDropNode,
    ancestorIds,
    showPlaceholder,
    editorState,
    updateEditorState,
    editorRef,
    readOnly
  } = baseProps;

  const nodes: React.ReactNode[] = [];

  if (!readOnly) {
    nodes.push(
      <DummyStartNodeRenderer
        key={`start-point-${containerId}`}
        containerId={containerId}
        cellId={cellId}
        isActive={isActive}
        cursor={cursor}
        hoverPath={hoverPath}
        onCursorChange={onCursorChange}
        setHoverPath={setHoverPath}
        onDropNode={onDropNode}
        ancestorIds={ancestorIds}
      />
    );
  }

  for (let i = 0; i <= children.length; i++) {
    // if cell active AND in this position
    if (isActive && cursor.containerId === containerId && cursor.index === i) {
      nodes.push(<span key={`cursor-${i}`} className="cursor" />);
    }

    if (i < children.length) {
      const child = children[i];

      nodes.push(
        <span
          key={`clickable-${i}`}
          onClick={(e) => {
            e.stopPropagation();
            if (containerId != null) {
              onCursorChange({ containerId, index: i + 1 });
            }
          }}
          className={clsx("math-node-wrapper", {
            hovered: getIsHovered(child, hoverPath),
          })}
        >
          <Renderer
            key={child.id}
            node={child}
            cellId={cellId}
            isActive={isActive}
            containerId={containerId}
            index={i}
            inheritedStyle={inheritedStyle}
            cursor={cursor}
            hoverPath={hoverPath}
            onCursorChange={onCursorChange}
            setHoverPath={setHoverPath}
            onDropNode={onDropNode}
            ancestorIds={ancestorIds}
            showPlaceholder={showPlaceholder}
            editorState={editorState}
            updateEditorState={updateEditorState}
            editorRef={editorRef}
            readOnly={readOnly}
          />
        </span>
      );
    }
  }

  return nodes;
}

// 1. Text Node
export function renderTextNode(
  node: TextNode,
  baseProps: CoreRenderProps,
): React.ReactNode {
  const styleClass = getStyleClass(baseProps.inheritedStyle);

  // map raw content if style requires it
  let finalContent = node.content;
  if (styleClass === "math-style-calligraphic") {
    finalContent = calligraphicMap[node.content] ?? node.content;
  } else if (styleClass === "math-style-blackboard") {
    finalContent = blackboardMap[node.content] ?? node.content;
  }

  return (
    <span
      data-nodeid={node.id}
      className={clsx("math-node", "type-text", styleClass, {
        "bracket-node": isOpeningBracket(node.content) || isClosingBracket(node.content),
        hovered: getIsHovered(node, baseProps.hoverPath),
      })}
      style={getInlineStyle(baseProps.inheritedStyle)}
      onMouseEnter={() => handleMouseEnter([...baseProps.ancestorIds], baseProps.setHoverPath)}
      onMouseLeave={(e) =>
        handleMouseLeave(e, baseProps.ancestorIds, baseProps.setHoverPath)
      }
    >
      {finalContent}
    </span>
  );
}

// 2. Multi Digit Node (renders as sequence of digits)
export function renderMultiDigitNode(
  node: MultiDigitNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const styleClass = getStyleClass(baseProps.inheritedStyle);
  return (
    <span
      data-nodeid={node.id}
      className={clsx("math-node", "type-multidigit", styleClass, { hovered: getIsHovered(node, baseProps.hoverPath) })}
      style={getInlineStyle(baseProps.inheritedStyle)}
      onMouseEnter={() => handleMouseEnter([...baseProps.ancestorIds], baseProps.setHoverPath)}
      onMouseLeave={(e) =>
        handleMouseLeave(e, baseProps.ancestorIds, baseProps.setHoverPath)
      }
    >
      {renderContainerChildren(node.children, {
        ...baseProps,
        containerId: node.id,
        inheritedStyle: {
          fontStyling: {
            fontStyle: "multidigit",
            fontStyleAlias: "",
          },
        },
      }, Renderer)}
    </span>
  );
}

// 4. Inline Container Node (has children)
export function renderInlineContainerNode(
  node: InlineContainerNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>,
): React.ReactNode {
  const styleClass = getStyleClass(baseProps.inheritedStyle);

  // Warning: might be super dirty way to implement this... I thought of it a little late
  // const isPartOfLibraryEntry = baseProps.cellId === "readonly";

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node",
        "type-inline-container",
        styleClass,
        { hovered: getIsHovered(node, baseProps.hoverPath) }
      )}
      style={getInlineStyle(baseProps.inheritedStyle)}
      onMouseEnter={() => handleMouseEnter([...baseProps.ancestorIds], baseProps.setHoverPath)}
      onMouseLeave={(e) =>
        handleMouseLeave(e, baseProps.ancestorIds, baseProps.setHoverPath)
      }
    >
      {/* {node.children.length < 1 && isPartOfLibraryEntry ? ( */}
      {node.children.length < 1 && baseProps.showPlaceholder ? (
        <span className="placeholder-square">⬚</span>
      ) : (
        renderContainerChildren(node.children, {
          ...baseProps,
          containerId: node.id,
        }, Renderer)
      )}
    </span>
  );
}

// 5. Group Node (has children)
export function renderGroupNode(
  node: GroupNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const styleClass = getStyleClass(inheritedStyle);
  const isHovered = getIsHovered(node, hoverPath);

  const handleEnter = () => handleMouseEnter([...ancestorIds], setHoverPath);
  const handleLeave = (e: React.MouseEvent) => handleMouseLeave(e, ancestorIds, setHoverPath);

  const childProps = {
    ...baseProps,
    node: node.child,
    containerId: node.child.id,
    index: 0,
  };

  return (
    <span
      data-nodeid={node.id}
      className={clsx("math-node", "type-group", styleClass, { hovered: isHovered })}
      style={getInlineStyle(inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="bracket bracket-open">{getOpenSymbol(node.bracketStyle)}</span>
      <span className="group-contents">
        <Renderer {...childProps} />
      </span>
      <span className="bracket bracket-close">{getCloseSymbol(node.bracketStyle)}</span>
    </span>
  );
}

// 6. Fraction Node (has numerator and denominator)
export function renderFractionNode(
  node: FractionNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const styleClass = getStyleClass(inheritedStyle);
  const isHovered = getIsHovered(node, hoverPath);

  const handleEnter = () => handleMouseEnter([...ancestorIds], setHoverPath);
  const handleLeave = (e: React.MouseEvent) => handleMouseLeave(e, ancestorIds, setHoverPath);

  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index,
  });

  const content = (
    <span className="fraction">
      <span className="numerator">
        <Renderer {...getChildProps(node.numerator, 0)} />
      </span>
      {node.variant === "frac" && <div className="line" />}
      <span className="denominator">
        <Renderer {...getChildProps(node.denominator, 1)} />
      </span>
    </span>
  );

  return (
    <span
      data-nodeid={node.id}
      className={clsx("math-node", "type-fraction", styleClass, {
        hovered: isHovered,
        "is-binom": node.variant === "binom",
      })}
      style={getInlineStyle(inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {node.variant === "binom" ? (
        <>
          <span className="binom-bracket left">(</span>
          {content}
          <span className="binom-bracket right">)</span>
        </>
      ) : (
        content
      )}
    </span>
  );
}

// 7. Nth Root Node (has root and radicand)
export function renderNthRootNode(
  node: NthRootNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const styleClass = getStyleClass(inheritedStyle);
  const isHovered = getIsHovered(node, hoverPath);

  const handleEnter = () => handleMouseEnter([...ancestorIds], setHoverPath);
  const handleLeave = (e: React.MouseEvent) => handleMouseLeave(e, ancestorIds, setHoverPath);

  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index,
  });

  return (
    <span
      data-nodeid={node.id}
      className={clsx("math-node", "type-nth-root", styleClass, { hovered: isHovered })}
      style={getInlineStyle(inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="nth-root-wrapper">
        <span className="nth-index">
          <Renderer {...getChildProps(node.index, 0)} />
        </span>
        <span className="radical-symbol" />
        <span className="radicand">
          <Renderer {...getChildProps(node.base, 1)} />
        </span>
      </span>
    </span>
  );
}

// 8. Big Operator Node (has lower and upper)
export function renderBigOperatorNode(
  node: BigOperatorNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const styleClass = getStyleClass(inheritedStyle);
  const isHovered = getIsHovered(node, hoverPath);

  const handleEnter = () => handleMouseEnter([...ancestorIds], setHoverPath);
  const handleLeave = (e: React.MouseEvent) => handleMouseLeave(e, ancestorIds, setHoverPath);

  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index,
  });

  // detect integrals
  const isIntegral = ["∫", "∬", "∭", "⨌", "∮"].includes(node.operator);

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node",
        styleClass,
        "type-big-operator",
        { integral: isIntegral },
        { hovered: isHovered })}
      style={getInlineStyle(inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="big-operator-wrapper">
        <div className="big-operator-upper">
          <Renderer {...getChildProps(node.upper, 0)} />
        </div>
        <div className="big-operator-symbol">{node.operator}</div>
        <div className="big-operator-lower">
          <Renderer {...getChildProps(node.lower, 1)} />
        </div>
      </div>
    </span>
  );
}

// 9. Childed Node (has 4 children)
export function renderChildedNode(
  node: ChildedNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const styleClass = getStyleClass(inheritedStyle);
  const isHovered = getIsHovered(node, hoverPath);

  const handleEnter = () => handleMouseEnter([...ancestorIds], setHoverPath);
  const handleLeave = (e: React.MouseEvent) => handleMouseLeave(e, ancestorIds, setHoverPath);

  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index,
  });

  const children = [
    { className: "sup-left", node: node.supLeft },
    { className: "sub-left", node: node.subLeft },
    { className: "base", node: node.base },
    { className: "sub-right", node: node.subRight },
    { className: "sup-right", node: node.supRight },
  ];

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node",
        "type-childed",
        node.variant === "subsup" ? "type-subsup" : "type-actsymb",
        styleClass,
        { hovered: isHovered }
      )}
      style={getInlineStyle(inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children.map(({ className, node: child }, i) => (
        <span key={className} className={className}>
          <Renderer {...getChildProps(child, i)} />
        </span>
      ))}
    </span>
  );
}

// 10. OverUnderset Node (has base)
export function renderOverUndersetNode(
  node: OverUndersetNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const styleClass = getStyleClass(baseProps.inheritedStyle);

  const commonProps = {
    cellId: baseProps.cellId,
    isActive: baseProps.isActive,
    cursor: baseProps.cursor,
    hoverPath: baseProps.hoverPath,
    onCursorChange: baseProps.onCursorChange,
    setHoverPath: baseProps.setHoverPath,
    inheritedStyle: baseProps.inheritedStyle,
    onDropNode: baseProps.onDropNode,
    showPlaceholder: baseProps.showPlaceholder,
    editorState: baseProps.editorState,
    updateEditorState: baseProps.updateEditorState,
    readOnly: baseProps.readOnly
  };

  const updatedAncestors = [node.id, ...(baseProps.ancestorIds ?? [])];

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node",
        "type-accented",
        styleClass,
        { hovered: getIsHovered(node, baseProps.hoverPath) }
      )}
      style={getInlineStyle(baseProps.inheritedStyle)}
      onClick={(e) => {
        e.stopPropagation();
        if (node.base.children.length === 0) {
          baseProps.onCursorChange({ containerId: node.base.id, index: 0 });
        }
      }}
      onMouseEnter={() => handleMouseEnter([...baseProps.ancestorIds], baseProps.setHoverPath)}
      onMouseLeave={(e) =>
        handleMouseLeave(e, updatedAncestors, baseProps.setHoverPath)
      }
    >
      {node.position === "above" && (
        <div className={clsx(node.variant, "accent-above")}>
          <Renderer
            node={node.content}
            {...commonProps}
            ancestorIds={updatedAncestors}
            containerId={node.content.id}
            index={0}
          />
        </div>
      )}

      <span className="accent-base">
        <Renderer
          node={node.base}
          {...commonProps}
          ancestorIds={updatedAncestors}
          containerId={node.base.id}
          index={0}
        />
      </span>

      {node.position === "below" && (
        <div className={clsx(node.variant, "accent-below")}>
          <Renderer
            node={node.content}
            {...commonProps}
            ancestorIds={updatedAncestors}
            containerId={node.content.id}
            index={0}
          />
        </div>
      )}
    </span>
  );
}

// 10. Decorated Node (has base)
export function renderDecoratedNode(
  node: DecoratedNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const styleClass = getStyleClass(baseProps.inheritedStyle);

  const commonProps = {
    cellId: baseProps.cellId,
    isActive: baseProps.isActive,
    cursor: baseProps.cursor,
    hoverPath: baseProps.hoverPath,
    onCursorChange: baseProps.onCursorChange,
    setHoverPath: baseProps.setHoverPath,
    inheritedStyle: baseProps.inheritedStyle,
    onDropNode: baseProps.onDropNode,
    showPlaceholder: baseProps.showPlaceholder,
    editorState: baseProps.editorState,
    updateEditorState: baseProps.updateEditorState,
    readOnly: baseProps.readOnly
  };

  const updatedAncestors = [node.id, ...(baseProps.ancestorIds ?? [])];

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node",
        "type-accented",
        `decoration-${node.decoration}`,
        styleClass,
        { hovered: getIsHovered(node, baseProps.hoverPath) }
      )}
      style={getInlineStyle(baseProps.inheritedStyle)}
      onClick={(e) => {
        e.stopPropagation();
        if (node.base.children.length === 0) {
          baseProps.onCursorChange({ containerId: node.base.id, index: 0 });
        }
      }}
      onMouseEnter={() => handleMouseEnter([...baseProps.ancestorIds], baseProps.setHoverPath)}
      onMouseLeave={(e) =>
        handleMouseLeave(e, updatedAncestors, baseProps.setHoverPath)
      }
    >
      <span className="accent-base">
        <Renderer
          node={node.base}
          {...commonProps}
          ancestorIds={updatedAncestors}
          containerId={node.base.id}
          index={0}
        />
      </span>
    </span>
  );
}

// 11. Styled Node (has child)
export function renderStyledNode(
  node: StyledNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const isHovered = getIsHovered(node, hoverPath);

  const combinedStyle: TextStyle = { //TODO memo this?
    ...inheritedStyle,
    ...node.style,
  };

  const styleClass = getStyleClass(combinedStyle);

  const handleEnter = () => handleMouseEnter([...ancestorIds], setHoverPath);
  const handleLeave = (e: React.MouseEvent) => handleMouseLeave(e, ancestorIds, setHoverPath);

  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    inheritedStyle: combinedStyle,
    index,
  });

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node",
        "type-styled",
        styleClass,
        { hovered: isHovered }
      )}
      style={getInlineStyle(combinedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Renderer {...getChildProps(node.child, 0)} />
    </span>
  );
}

export function renderMatrixNode(
  node: MatrixNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const styleClass = getStyleClass(inheritedStyle);
  const isHovered = getIsHovered(node, hoverPath);
  const bracketMap: Record<MatrixNode["bracketStyle"], [string, string]> = {
    none: ["", ""],
    parenthesis: ["(", ")"],
    square: ["[", "]"],
    curly: ["{", "}"],
    vertical: ["|", "|"],
    double_vertical: ["‖", "‖"],
  };

  const [leftBracket, rightBracket] = bracketMap[node.bracketStyle] ?? ["", ""];

  const handleEnter = () => handleMouseEnter([...ancestorIds], setHoverPath);
  const handleLeave = (e: React.MouseEvent) =>
    handleMouseLeave(e, ancestorIds, setHoverPath);

  const getCellProps = (
    childNode: MathNode
  ): CoreRenderProps => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index: 0,
    inheritedStyle,
  });

  const scaleY = node.rows.length * 1.35;

  // approximately nice-looking:
  const shiftY = -47.5 * (1 - 1 / scaleY);

  return (
    <span
      data-nodeid={node.id}
      className={clsx("math-node", "type-matrix", styleClass, {
        hovered: isHovered,
        [`bracket-${node.bracketStyle}`]: node.bracketStyle !== "none",
      })}
      style={getInlineStyle(inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {leftBracket && (
        <span
          className="matrix-bracket left"
          style={{
            transform: `scale(1, ${scaleY}) translateY(${shiftY}%)`,
            transformOrigin: "top left"
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
              <Renderer {...getCellProps(cell)} />
            </span>
          ))
        )}
      </span>

      {rightBracket && (
        <span
          className="matrix-bracket right"
          style={{
            transform: `scale(1, ${scaleY}) translateY(${shiftY}%)`,
            transformOrigin: "top left"
          }}
        >
          {rightBracket}
        </span>
      )}
    </span>
  );
}

// 12. Root Wrapper Node (has child)
export function renderRootWrapperNode(
  node: RootWrapperNode,
  baseProps: CoreRenderProps,
  Renderer: React.NamedExoticComponent<CoreRenderProps>
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const styleClass = getStyleClass(inheritedStyle);
  const isHovered = getIsHovered(node, hoverPath);

  const handleEnter = () => handleMouseEnter([...ancestorIds], setHoverPath);
  const handleLeave = (e: React.MouseEvent) => handleMouseLeave(e, [], setHoverPath);

  const getChildProps = (childNode: MathNode, index: number) => ({
    ...baseProps,
    node: childNode,
    containerId: childNode.id,
    index,
  });

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node",
        "type-root-wrapper",
        styleClass,
        { hovered: isHovered }
      )}
      style={getInlineStyle(baseProps.inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Renderer {...getChildProps(node.child, 0)} />
    </span>
  );
}
