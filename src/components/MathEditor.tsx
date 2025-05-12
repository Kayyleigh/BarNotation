// components/MathEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { MathRenderer } from './MathRenderer';
import type { MathNode, TextNode } from '../models/types';
import { generateId, createTextNode, createInlineContainer } from '../models/nodeFactories';
import {
  transformToFraction,
  transformToSubscript,
  transformToSuperscript,
} from '../models/transformations';
import Toolbar from './Toolbar';
import { findParentAndIndex, getLogicalChildren, findNextPositionUp } from '../utils/treeUtils';

const initialNode: TextNode = {
  id: generateId(),
  type: 'text',
  content: '',
};

const MathEditor: React.FC = () => {
  const [rootNode, setRootNode] = useState<MathNode>(createInlineContainer([initialNode]));
  const [selectedId, setSelectedId] = useState<string | null>(initialNode.id);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    editorRef.current?.focus();
  }, []);

  const replaceChildInNode = (
    node: MathNode,
    childIndex: number,
    newChild: MathNode
  ): MathNode => {
    if ('children' in node) {
      const newChildren = [...node.children];
      newChildren[childIndex] = newChild;
      return { ...node, children: newChildren };
    }
  
    if ('numerator' in node && 'denominator' in node) {
      return {
        ...node,
        numerator: childIndex === 0 ? newChild : node.numerator,
        denominator: childIndex === 1 ? newChild : node.denominator,
      };
    }
  
    if ('base' in node) {
      const parts = [node.base, node.subLeft, node.supLeft, node.subRight, node.supRight];
      const updatedParts = [...parts];
      updatedParts[childIndex] = newChild;
      const [base, subLeft, supLeft, subRight, supRight] = updatedParts;
      return { ...node, base, subLeft, supLeft, subRight, supRight };
    }
  
    if ('radicand' in node) {
      return {
        ...node,
        radicand: childIndex === 0 ? newChild : node.radicand,
        degree: childIndex === 1 ? newChild : node.degree,
      };
    }
  
    return node;
  };

  const findAndUpdate = (
    node: MathNode,
    matchId: string,
    update: (node: MathNode) => MathNode
  ): MathNode => {
    if (node.id === matchId) {
      return update(node);
    }
  
    const children = getLogicalChildren(node);
    if (children.length === 0) return node;
  
    for (let i = 0; i < children.length; i++) {
      const updatedChild = findAndUpdate(children[i], matchId, update);
      if (updatedChild !== children[i]) {
        return replaceChildInNode(node, i, updatedChild);
      }
    }
  
    return node;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedId) return;

    const updateMathNode = (append: string) => {
      setRootNode(prev =>
        findAndUpdate(prev, selectedId, node => {
          if (node.type === 'text') {
            return { ...node, content: node.content + append };
          }
          else {
            console.log(`Woahh ${node.type} gets key ${append}`)
          }
          return node;
        })
      );
    };

    switch (e.key) {
      case '/':
        e.preventDefault();
        setRootNode(prev => {
          const pos = findParentAndIndex(prev, selectedId);
          if (!pos || !pos.parent) return prev;
      
          const parent = pos.parent;
          const children = getLogicalChildren(parent);
          const currentIndex = pos.index;

          const currentNode = children[currentIndex]

          const transformed = transformToFraction(currentNode);
          setSelectedId(transformed.denominator.id);

          const updatedRoot = findAndUpdate(prev, currentNode.id, () => transformed);
          return updatedRoot;
        });
        break;

      case '_':
        e.preventDefault();
        setRootNode(prev => {
          const pos = findParentAndIndex(prev, selectedId);
          if (!pos || !pos.parent) return prev;
      
          const parent = pos.parent;
          const children = getLogicalChildren(parent);
          const currentIndex = pos.index;

          const currentNode = children[currentIndex]

          const transformed = transformToSuperscript(currentNode);
          setSelectedId(transformed.subRight?.id ?? null);

          const updatedRoot = findAndUpdate(prev, currentNode.id, () => transformed);
          return updatedRoot;
        });
        break;

      case '^':
        e.preventDefault();
        setRootNode(prev => {
          const pos = findParentAndIndex(prev, selectedId);
          if (!pos || !pos.parent) return prev;
      
          const parent = pos.parent;
          const children = getLogicalChildren(parent);
          const currentIndex = pos.index;

          const currentNode = children[currentIndex]

          const transformed = transformToSuperscript(currentNode);
          setSelectedId(transformed.supRight?.id ?? null);

          const updatedRoot = findAndUpdate(prev, currentNode.id, () => transformed);
          return updatedRoot;
        });
        break;

      case 'ArrowRight': {
        e.preventDefault();
        setRootNode(prev => {
          const pos = findParentAndIndex(prev, selectedId);
          console.log(pos)
          if (!pos || !pos.parent) return prev;
      
          const parent = pos.parent;
          const children = getLogicalChildren(parent);
          const currentIndex = pos.index;
          const currentNode = children[currentIndex];
      
          const isEmptyText = currentNode.type === 'text' && currentNode.content.trim() === '';
      
          if (isEmptyText) {
            const nextId = findNextPositionUp(prev, selectedId);
            if (nextId) {
              setSelectedId(nextId);
              return prev;
            }
            console.log("THis is weird?")
            // If nowhere to go, create new node at top level
            const newNode = createTextNode();
            const updatedRoot = {
              ...prev,
              children: [...(getLogicalChildren(prev)), newNode],
            };
            setSelectedId(newNode.id);
            return updatedRoot;
          }
      
          // Regular arrow right logic
          if (currentIndex + 1 < children.length) {
            setSelectedId(children[currentIndex + 1].id);
            return prev;
          } else {
            const newNode = createTextNode();
            const updatedChildren = [...children, newNode];
            const updatedParent = updatedChildren.reduce(
              (acc, child, i) => replaceChildInNode(acc, i, child),
              parent
            );
            const updatedRoot = findAndUpdate(prev, parent.id, () => updatedParent);
            setSelectedId(newNode.id);
            return updatedRoot;
          }
        });
        break;
      }

      case 'ArrowLeft': {
        e.preventDefault();
        setRootNode(prev => {
          const pos = findParentAndIndex(prev, selectedId);
          if (!pos || !pos.parent) return prev;
      
          const parent = pos.parent;
          const children = getLogicalChildren(parent);
          const currentIndex = pos.index;
      
          if (currentIndex > 0) {
            // Move to the previous sibling
            setSelectedId(children[currentIndex - 1].id);
            return prev;
          } else {
            // If there's no previous sibling, move to the parent node
            const updatedRoot = findAndUpdate(prev, parent.id, updatedParent => {
              setSelectedId(updatedParent.id);
              return updatedParent;
            });
            return updatedRoot;
          }
        });
        break;
      }

      case 'Backspace':
        e.preventDefault();
        setRootNode(prev => {
          const pos = findParentAndIndex(prev, selectedId);
          if (!pos || !pos.parent) return prev;
      
          const parent = pos.parent;
          const children = getLogicalChildren(parent);
          const currentIndex = pos.index;

          const currentNode = children[currentIndex]

          // If it's a text node and not empty: delete character
          if (currentNode.type === 'text' && currentNode.content.length > 0) {
            return findAndUpdate(prev, selectedId, node => ({
              ...node,
              content: (node as TextNode).content.slice(0, -1),
            }));
          }

          // Check if we are at very root of whole program
          const grandparent = findParentAndIndex(prev, parent.id)
          if (grandparent === null && currentIndex <1) {
            return prev;
          }
      
          // Otherwise: remove node and select previous
          if ('children' in parent) {
            const newChildren = [...parent.children];
            newChildren.splice(currentIndex, 1);
      
            const newSelected = newChildren[currentIndex - 1] ?? parent;
            setSelectedId(newSelected.id);
      
            return findAndUpdate(prev, parent.id, node => ({
              ...node,
              children: newChildren,
            }));
          } else if ('numerator' in parent && 'denominator' in parent) {
            if (currentNode.id === parent.denominator.id) {
              setSelectedId(parent.numerator.id)
              return findAndUpdate(prev, parent.id, () => parent.numerator);
            } else if (currentNode.id === parent.numerator.id) {
              setSelectedId(parent.denominator.id)
              return findAndUpdate(prev, parent.id, () => parent.denominator);
            }
          }
      
          return prev;
        });
        break;

      default:
        if (/^[a-zA-Z0-9=:;\'\"\`~|?.,<>?+!@#$%&*()\[\]\{\}\-]$/.test(e.key)) {
            console.log(`The key is ${e.key}`)
          e.preventDefault();
          updateMathNode(e.key);
        }
    }
  };

  const handleAddNode = (node: MathNode) => {
    if (!selectedId) return;

    setRootNode(prev =>
      findAndUpdate(prev, selectedId, selected => {
        if ('children' in selected) {
          return { ...selected, children: [...selected.children, node] };
        }
        return selected;
      })
    );
  };

  return (
    <div className="editor-container">
      <Toolbar onAddNode={handleAddNode} />
      <div
        ref={editorRef}
        className="math-editor"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <MathRenderer
          node={rootNode}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRootChange={setRootNode}
        />
      </div>
    </div>
  );
};

export default MathEditor;
