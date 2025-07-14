// // MathRenderers.tsx

// import React from 'react';
// import { MathRenderer } from './MathRenderer';
// import type {
//   MathNode,
//   TextNode,
//   InlineContainerNode,
//   GroupNode,
//   FractionNode,
//   ChildedNode,
//   AccentedNode,
//   StyledNode,
//   TextStyle,
//   MultiDigitNode,
//   CommandInputNode,
//   BigOperatorNode,
//   RootWrapperNode,
//   NthRootNode,
// } from '../../models/types';
// import clsx from 'clsx';
// import type { CursorPosition } from '../../logic/cursor';
// import '../../styles/math-node.css';
// import '../../styles/accents.css';
// import { getCloseSymbol, getOpenSymbol, isClosingBracket, isOpeningBracket } from '../../utils/bracketUtils';

// type RenderProps = {
//   isActive: boolean;

//   cursor: CursorPosition;
//   dropTargetCursor: CursorPosition;

//   hoverPath?: string;
//   setHoverPath: (hoverPath?: string) => void;

//   onCursorChange: (cursor: CursorPosition) => void;
//   onRootChange: (newRoot: MathNode) => void;

//   // Drag-and-drop handlers
//   // onStartDrag: (nodeId: string) => void;
//   // onUpdateDropTarget: (targetId: string, targetIndex: number) => void;
//   // onHandleDrop: () => void;
//   // onClearDrag: () => void;
  
//   parentContainerId?: string;
//   index?: number;
//   inheritedStyle?: TextStyle;
//   ancestorIds?: string[]; // list of ancestor node ids from closest to farthest
// };

// // ---------- Helper Utilities ----------

// function getStyleClass(style?: TextStyle): string {
//   return clsx({
//     "math-style-normal": style?.fontStyling?.fontStyle === "normal",
//     "math-style-upright": style?.fontStyling?.fontStyle === "upright",
//     "math-style-command": style?.fontStyling?.fontStyle === "command",
//     "math-style-bold": style?.fontStyling?.fontStyle === "bold",
//     "math-style-calligraphic": style?.fontStyling?.fontStyle === "calligraphic",
//     "math-style-blackboard": style?.fontStyling?.fontStyle === "blackboard",
//   });
// }

// function getInlineStyle(style?: TextStyle): React.CSSProperties {
//   return {
//     color: style?.color,
//     fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
//   };
// }

// let hoverClearTimeout: number | null = null;

// function handleMouseEnter(nodeId: string, setHoverPath: (id?: string) => void) {
//   if (hoverClearTimeout) {
//     clearTimeout(hoverClearTimeout);
//     hoverClearTimeout = null;
//   }
//   setHoverPath(nodeId);
// }

// function handleMouseLeave(
//   e: React.MouseEvent,
//   nodeId: string,
//   ancestorIds: string[] = [],
//   setHoverPath: (id?: string) => void
// ) {
//   const related = e.relatedTarget as HTMLElement | null;

//   if (related && related instanceof Node && e.currentTarget.contains(related)) {
//     return;
//   }

//   // Check ancestors from closest to farthest
//   for (const ancestorId of ancestorIds) {
//     const ancestorElem = document.querySelector(`[data-nodeid="${ancestorId}"]`);
//     if (ancestorElem && related instanceof Node && ancestorElem.contains(related)) {
//       setHoverPath(ancestorId);
//       return;
//     }
//   }

//   hoverClearTimeout = window.setTimeout(() => {
//     setHoverPath(undefined);
//     hoverClearTimeout = null;
//   }, 0);
// }

// function getIsHovered(node: MathNode, props: RenderProps): boolean {
//   if (props.hoverPath === node.id) {
//     return true;
//   }
//   return false;
// }

// function renderContainerChildren(
//   children: MathNode[],
//   containerId: string,
//   props: RenderProps,
//   inheritedStyle?: TextStyle
// ): React.ReactNode {
//   const { isActive, cursor, dropTargetCursor, hoverPath, 
//     onCursorChange, onRootChange, setHoverPath, 
//     //onClearDrag, onHandleDrop, onStartDrag, onUpdateDropTarget, 
//     ancestorIds } = props;
//   const isCursorInThisContainer = cursor.containerId === containerId;
//   //const inDragState = dropTargetCursor.containerId !== null && dropTargetCursor.index !== null;
//   const inDragState = false
//   const newAncestorIds = [containerId, ...(ancestorIds ?? [])];

//   return (
//     <>
//       {children.map((child, i) => {
//         const elements: React.ReactNode[] = [];

//         if (isActive && !inDragState && isCursorInThisContainer && cursor.index === i) {
//           elements.push(
//           <span 
//             key={`cursor-${i}`} 
//             className="cursor" 
//           />);
//         }

//         elements.push(
//         <span 
//           key={`clickable-${i}`} 
//           onClick={(e) => {
//             e.stopPropagation();
//             if (containerId && i + 1) {
//               onCursorChange({ containerId: containerId, index: i + 1 });
//             }
//           }
//         }>
//           <MathRenderer
// 					  {...props}
//             key={child.id}
//             node={child}
//             isActive={isActive}
//             cursor={cursor}
//             dropTargetCursor={dropTargetCursor}
//             hoverPath={hoverPath}
//             onCursorChange={onCursorChange}
//             onRootChange={onRootChange}
//             setHoverPath={setHoverPath}
//             // onClearDrag={onClearDrag}
//             // onHandleDrop={onHandleDrop}
//             // onStartDrag={onStartDrag}
//             // onUpdateDropTarget={onUpdateDropTarget}
//             parentContainerId={containerId}
//             ancestorIds={newAncestorIds}
//             index={i + 1}
//             inheritedStyle={inheritedStyle}
//           />
//           </span>
//         );
//         return elements;
//       })}
//       {isActive && !inDragState && isCursorInThisContainer && cursor.index === children.length && (
//         <span className="cursor" />
//       )}
//     </>
//   );
// }

// // ---------- Renderers ----------

// export const renderTextNode = (
//   node: TextNode,
//   props: RenderProps
// ) => {

//   const { index, parentContainerId, onCursorChange, inheritedStyle } = props;

//   const isSelected = props.cursor.containerId === node.id; //TODO: remove? I don't think I am using this anymore
  
//   const className = clsx(
//     "math-node",
//     "type-text",
//     { selected: isSelected },
//     { hovered: getIsHovered(node, props) },
//     { "bracket-node": isOpeningBracket(node.content) || isClosingBracket(node.content) },
//     getStyleClass(inheritedStyle)
//   );

//   const style = getInlineStyle(inheritedStyle);

//   return (
//     <span
//       data-nodeid={node.id}
//       className={className}
//       style={style}
//       onClick={(e) => {
//         e.stopPropagation();
//         if (parentContainerId && index) {
//           onCursorChange({ containerId: parentContainerId, index });
//         }
//       }}
//       onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//       onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}
//     >
//       {node.content}
//     </span>
//   );
// };

// export const renderStyledNode = (node: StyledNode, props: RenderProps) => {
//   const mergedStyle: TextStyle = {
//     ...props.inheritedStyle,
//     ...node.style,
//   };
//   const newAncestorIds = [node.id, ...(props.ancestorIds ?? [])];

//   return (
//     <span 
//       data-nodeid={node.id}
//       className={getStyleClass(mergedStyle)} 
//       style={getInlineStyle(mergedStyle)}
//     >
//       <MathRenderer
//         node={node.child}
//         {...props} 
//         ancestorIds={newAncestorIds}
//         inheritedStyle={mergedStyle}
//       />
//     </span>
//   );
// };

// export const renderRootWrapperNode = (
//   node: RootWrapperNode,
//   props: RenderProps
// ) => {
//   const child = node.child;
//   if (!child) return <span className="math-node root-wrapper-empty" />;

//   const newAncestorIds = [node.id, ...(props.ancestorIds ?? [])];

//   return (
//     <span 
//       data-nodeid={node.id}
//       className="math-node root-wrapper"
//     >
//       <MathRenderer
//         node={child}
//         {...props} 
//         ancestorIds={newAncestorIds}
//         parentContainerId={node.id}
//         index={0}
//       />
//     </span>
//   );
// };

// export const renderMultiDigitNode = (
//   node: MultiDigitNode,
//   props: RenderProps
// ) => {
//   return (
//     <span
//       data-nodeid={node.id}
//       className={clsx(
//         "math-node", 
//         "type-multi-digit",
//         { hovered: getIsHovered(node, props) },
//       )}
//       onClick={(e) => {
//         e.stopPropagation();
//         if (node.id) {
//           props.onCursorChange({ containerId: node.id, index: 0 });
//         }
//       }}
//       onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//       onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}
//     >
//       {renderContainerChildren(node.children, node.id, props, props.inheritedStyle)}
//     </span>
//   );
// };

// export const renderCommandInputNode = (
//   node: CommandInputNode,
//   props: RenderProps
// ) => (
//   <span
//     data-nodeid={node.id}
//     className={clsx(
//       "math-node", 
//       "type-command-input", 
//       "font-mono", 
//       "text-gray-600",     
//       { hovered: getIsHovered(node, props) },
//     )}
//     onClick={(e) => {
//       e.stopPropagation();
//       if (node.id) {
//         props.onCursorChange({ containerId: node.id, index: 0 });
//       }
//     }}
//     onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//     onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}
//   >
//     {renderContainerChildren(node.children, node.id, props, { fontStyling: { fontStyle: 'command', fontStyleAlias: "" } })}
//   </span>
// );

// export const renderInlineContainerNode = (
//   node: InlineContainerNode,
//   props: RenderProps
// ) => (
//   <span
//     data-nodeid={node.id}
//     className={clsx(
//       "math-node", 
//       "type-inline-container",
//       { hovered: getIsHovered(node, props) },
//     )}
//     onClick={(e) => {
//       e.stopPropagation();
//       if (node.id) {
//         props.onCursorChange({ containerId: node.id, index: 0 });
//       }
//     }}
//     onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//     onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}
//   >
//     {renderContainerChildren(node.children, node.id, props, props.inheritedStyle)}
//   </span>
// );

// export const renderFractionNode = (
//   node: FractionNode,
//   props: RenderProps
// ) => (
//   <span
//     data-nodeid={node.id}
//     className={clsx(
//       "math-node", 
//       "type-fraction",
//       { hovered: getIsHovered(node, props) },
//     )}
//     onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//     onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}

//   >
//     <div className="fraction">
//       <div className="numerator">
//         <MathRenderer
// 					node={node.numerator} 
//           {...props} 
//           ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} 
//         />
//       </div>
//       <div className="line"></div>
//       <div className="denominator">
//         <MathRenderer
// 					node={node.denominator} 
//           {...props} 
//           ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} 
//         />
//       </div>
//     </div>
//   </span>
// );

// export const renderGroupNode = (
//   node: GroupNode,
//   props: RenderProps
// ) => (
//   <span
//     data-nodeid={node.id}  
//     className={clsx(
//       "math-node", 
//       "type-group", 
//       `bracket-${node.bracketStyle}`,
//       { hovered: getIsHovered(node, props) },
//     )}
//     onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//     onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}

//   >
//     <span className="bracket bracket-open">{getOpenSymbol(node.bracketStyle)}</span>
//     <span
//       className="group-contents"
//       onClick={(e) => {
//         e.stopPropagation();
//         if (node.child.children.length === 0) {
//           props.onCursorChange({ containerId: node.child.id, index: 0 });
//         }
//       }}
//     >
//       <MathRenderer
//         node={node.child} 
//         {...props} 
//         ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} 
//       />
//     </span>
//     <span className="bracket bracket-close">{getCloseSymbol(node.bracketStyle)}</span>
//   </span>
// );

// export const renderChildedNode = (
//   node: ChildedNode,
//   props: RenderProps
// ) => (
//   <span
//     data-nodeid={node.id}
//     className={clsx(
//       "math-node", 
//       "type-childed", 
//       node.variant === 'subsup' ? "type-subsup" : "type-actsymb",
//       { hovered: getIsHovered(node, props) },
//     )}
//     onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//     onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}

//   >
//     <span className="sup-left"><MathRenderer
// 					node={node.supLeft} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
//     <span className="sub-left"><MathRenderer
// 					node={node.subLeft} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
//     <span className="base"><MathRenderer
// 					node={node.base} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
//     <span className="sub-right"><MathRenderer
// 					node={node.subRight} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
//     <span className="sup-right"><MathRenderer
// 					node={node.supRight} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} /></span>
//   </span>
// );

// export const renderAccentedNode = (
//   node: AccentedNode,
//   props: RenderProps
// ) => {
//   const renderCustomAccent = (position: "above" | "below") => (
//     <div className={`accent-content accent-${position}`}>
//       <MathRenderer
//         node={node.accent.content}
//         {...props} 
//         ancestorIds={[node.id, ...(props.ancestorIds ?? [])]}
//         parentContainerId={node.accent.content.id}
//         index={0}
//       />
//     </div>
//   );

//   const isCustom = node.accent.type === "custom";

//   return (
//     <span
//       data-nodeid={node.id}
//       className={clsx(
//         "math-node decorated-node",
//         isCustom ? "decoration-custom" : `decoration-${node.accent.decoration}`,
//         { hovered: getIsHovered(node, props) },
//       )}
//       onClick={(e) => {
//         e.stopPropagation();
//         if (node.base.children.length === 0) {
//           props.onCursorChange({ containerId: node.base.id, index: 0 });
//         }
//       }}
//       onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//       onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}
//     >
//       {isCustom && node.accent.position === "above" && renderCustomAccent("above")}
//       <span className="accent-base">
//         <MathRenderer
// 					node={node.base} 
//           {...props} 
//           ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} 
//         /></span>
//       {isCustom && node.accent.position === "below" && renderCustomAccent("below")}
//     </span>
//   );
// };

// export const renderBigOperatorNode = (
//   node: BigOperatorNode,
//   props: RenderProps
// ) => (
//   <span
//     data-nodeid={node.id}
//     className={clsx(
//       "math-node", 
//       "type-big-operator",
//       { hovered: getIsHovered(node, props) },
//     )}
//     onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//     onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}

//   >
//     <div className="big-operator-wrapper">
//       <div className="big-operator-upper">
//         <MathRenderer
// 					node={node.upper} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} />
//       </div>
//       <div className="big-operator-symbol">{node.operator}</div>
//       <div className="big-operator-lower">
//         <MathRenderer
// 					node={node.lower} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} />
//       </div>
//     </div>
//   </span>
// );

// export const renderNthRootNode = (
//   node: NthRootNode,
//   props: RenderProps
// ) => (
//   <span
//     data-nodeid={node.id}
//     className={clsx(
//       "math-node", 
//       "type-nth-root",
//       { hovered: getIsHovered(node, props) },
//     )}
//     onMouseEnter={() => handleMouseEnter(node.id, props.setHoverPath!)}
//     onMouseLeave={(e) => handleMouseLeave(e, node.id, props.ancestorIds, props.setHoverPath!)}
//   >

//     <div className="nth-root-wrapper">
//       <span className="nth-index">
//         <MathRenderer
// 					node={node.index} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} parentContainerId={node.id} index={0} />
//       </span>
//       <span
//         className="radical-symbol"></span>
//       <span className="radicand">
//         <MathRenderer
// 				  node={node.base} {...props} ancestorIds={[node.id, ...(props.ancestorIds ?? [])]} parentContainerId={node.id} index={1} />
//       </span>
//     </div>
//   </span>
// );

// ----------------------------------- VERSION 2 (WORKS WELL BUT SLOW AND HUGE AND UNMAINTAINABLE) -------------------------------

import React from "react";
import clsx from "clsx";
import type {
  TextNode,
  MultiDigitNode,
  CommandInputNode,
  InlineContainerNode,
  GroupNode,
  FractionNode,
  NthRootNode,
  BigOperatorNode,
  ChildedNode,
  AccentedNode,
  StyledNode,
  RootWrapperNode,
  MathNode,
  TextStyle,
} from "../../models/types";
import '../../styles/math-node.css';
import '../../styles/accents.css';
import { MathRenderer, type BaseRenderProps, type MathRendererProps } from "./MathRenderer";
import { getCloseSymbol, getOpenSymbol, isClosingBracket, isOpeningBracket } from "../../utils/bracketUtils";
import { getIsHovered, handleMouseEnter, handleMouseLeave } from "../../utils/mathHoverUtils";
import DummyStartNodeRenderer from "./DummyStartNodeRenderer";

// Helper to get CSS classes for font styles
function getStyleClass(style: TextStyle) {
  return clsx({
    "math-style-normal": style.fontStyling?.fontStyle === "normal",
    "math-style-upright": style.fontStyling?.fontStyle === "upright",
    "math-style-command": style.fontStyling?.fontStyle === "command",
    "math-style-bold": style.fontStyling?.fontStyle === "bold",
    "math-style-calligraphic": style.fontStyling?.fontStyle === "calligraphic",
    "math-style-blackboard": style.fontStyling?.fontStyle === "blackboard",
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
  baseProps: BaseRenderProps
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
  } = baseProps;

  const nodes: React.ReactNode[] = [];

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
          // onMouseEnter={() => handleMouseEnter([...baseProps.ancestorIds], setHoverPath)}
          // onMouseLeave={(e) =>
          //   handleMouseLeave(e, [...ancestorIds], setHoverPath)
          // }
          className={clsx("math-node-wrapper", {
            hovered: getIsHovered(child, hoverPath),
          })}
        >
          <MathRenderer
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
  baseProps: BaseRenderProps
): React.ReactNode {
  const styleClass = getStyleClass(baseProps.inheritedStyle);
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
      {node.content}
    </span>
  );
}

// 2. Multi Digit Node (renders as sequence of digits)
export function renderMultiDigitNode(
  node: MultiDigitNode,
  baseProps: BaseRenderProps & MathRendererProps
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
      })}
    </span>
  );
}

// 3. Command Input Node
export function renderCommandInputNode(
  node: CommandInputNode,
  baseProps: BaseRenderProps & MathRendererProps
): React.ReactNode {
  const styleClass = getStyleClass(baseProps.inheritedStyle);
  return (
    <span
      data-nodeid={node.id}
      className={clsx("math-node", "type-command-input", styleClass, { hovered: getIsHovered(node, baseProps.hoverPath) })}
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
            fontStyle: 'command', 
            fontStyleAlias: "" 
          } 
        }
      })}
    </span>
  );
}

// 4. Inline Container Node (has children)
export function renderInlineContainerNode(
  node: InlineContainerNode,
  baseProps: BaseRenderProps & MathRendererProps,
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
        })
      )}
    </span>
  );
}

// 5. Group Node (has children)
export function renderGroupNode(
  node: GroupNode,
  baseProps: BaseRenderProps & MathRendererProps
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
        <MathRenderer {...childProps} />
      </span>
      <span className="bracket bracket-close">{getCloseSymbol(node.bracketStyle)}</span>
    </span>
  );
}

// 6. Fraction Node (has numerator and denominator)
export function renderFractionNode(
  node: FractionNode,
  baseProps: BaseRenderProps & MathRendererProps
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
      className={clsx("math-node", "type-fraction", styleClass, { hovered: isHovered })}
      style={getInlineStyle(inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="numerator">
        <MathRenderer {...getChildProps(node.numerator, 0)} />
      </span>
      <div className="line"></div>
      <span className="denominator">
        <MathRenderer {...getChildProps(node.denominator, 1)} />
      </span>
    </span>
  );
}

// 7. Nth Root Node (has root and radicand)
export function renderNthRootNode(
  node: NthRootNode,
  baseProps: BaseRenderProps & MathRendererProps
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
          <MathRenderer {...getChildProps(node.index, 0)} />
        </span>
        <span className="radical-symbol" />
        <span className="radicand">
          <MathRenderer {...getChildProps(node.base, 1)} />
        </span>
      </span>
    </span>
  );
}

// 8. Big Operator Node (has lower and upper)
export function renderBigOperatorNode(
  node: BigOperatorNode,
  baseProps: BaseRenderProps & MathRendererProps
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
      className={clsx("math-node", styleClass, "type-big-operator", { hovered: isHovered })}
      style={getInlineStyle(inheritedStyle)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="big-operator-wrapper">
        <div className="big-operator-upper">
          <MathRenderer {...getChildProps(node.upper, 0)} />
        </div>
        <div className="big-operator-symbol">{node.operator}</div>
        <div className="big-operator-lower">
          <MathRenderer {...getChildProps(node.lower, 1)} />
        </div>
      </div>
    </span>
  );
}

// 9. Childed Node (has 4 children)
export function renderChildedNode(
  node: ChildedNode,
  baseProps: BaseRenderProps & MathRendererProps
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
          <MathRenderer {...getChildProps(child, i)} />
        </span>
      ))}
    </span>
  );
}


// 10. Accented Node (has base)
export function renderAccentedNode(
  node: AccentedNode,
  baseProps: BaseRenderProps & MathRendererProps
): React.ReactNode {
  const styleClass = getStyleClass(baseProps.inheritedStyle);
  const isCustom = node.accent.type === "custom";
  const above = isCustom && node.accent.position === "above";
  const below = isCustom && node.accent.position === "below";

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
  };

  const updatedAncestors = [node.id, ...(baseProps.ancestorIds ?? [])];

  return (
    <span
      data-nodeid={node.id}
      className={clsx(
        "math-node",
        "type-accented",
        isCustom ? "decoration-custom" : `decoration-${node.accent.decoration}`,
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
      {above && (
        <div className="accent-content accent-above">
          <MathRenderer
            node={node.accent.content}
            {...commonProps}
            ancestorIds={updatedAncestors}
            containerId={node.accent.content.id}
            index={0}
          />
        </div>
      )}

      <span className="accent-base">
        <MathRenderer
          node={node.base}
          {...commonProps}
          ancestorIds={updatedAncestors}
          containerId={node.base.id}
          index={0}
        />
      </span>

      {below && (
        <div className="accent-content accent-below">
          <MathRenderer
            node={node.accent.content}
            {...commonProps}
            ancestorIds={updatedAncestors}
            containerId={node.accent.content.id}
            index={0}
          />
        </div>
      )}
    </span>
  );
}

// 11. Styled Node (has child)
export function renderStyledNode(
  node: StyledNode,
  baseProps: BaseRenderProps & MathRendererProps
): React.ReactNode {
  const { inheritedStyle, ancestorIds, setHoverPath, hoverPath } = baseProps;
  const isHovered = getIsHovered(node, hoverPath);

  const combinedStyle: TextStyle = {
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
      <MathRenderer {...getChildProps(node.child, 0)} />
    </span>
  );
}

// 12. Root Wrapper Node (has child)
export function renderRootWrapperNode(
  node: RootWrapperNode,
  baseProps: BaseRenderProps & MathRendererProps
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
      <MathRenderer {...getChildProps(node.child, 0)} />
    </span>
  );
}
