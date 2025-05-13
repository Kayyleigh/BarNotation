// components/MathEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { MathRenderer } from './MathRenderer';
import { nodeToMathText, nodeToString, type MathNode, type TextNode } from '../models/types';
import { generateId, createTextNode, createInlineContainer } from '../models/nodeFactories';
import {
  transformToFraction,
  transformToSubscript,
  transformToSuperscript,
} from '../models/transformations';
import Toolbar from './Toolbar';
import { findParentAndIndex, getLogicalChildren, findPathToNode, getAllNodesInPreOrder, getLeafNodesInPreOrder, getPreviousLeaf, isEmptyNode } from '../utils/treeUtils';
import { nodeToLatex } from '../models/latexParser';

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

  // Helper function for arrow navigation
  const handleArrowNavigation = (e: React.KeyboardEvent, direction: 'left' | 'right') => {
    if (!selectedId) {
      console.log("Oh no")
      return;
    }
  
    // Choose pre-order traversal type based on whether shift key is pressed
    // TODO: probably make shift exclude all leaves? Or do not use shift cuz shift seems nice for grouping
    const traversal = e.shiftKey ? getAllNodesInPreOrder(rootNode) : getLeafNodesInPreOrder(rootNode);

    const index = traversal.findIndex(n => n.id === selectedId);
    const nextIndex =
      direction === 'right' ? index + 1 :
      direction === 'left' ? index - 1 :
      index;
  
    if (nextIndex >= 0 && nextIndex < traversal.length) {
      console.log(`nextIndex >= 0 && nextIndex < traversal.length`)
      setSelectedId(traversal[nextIndex].id);
    } 
    else {
      console.log(`edge case? in arrows`)

      // Edge case: find insertable ancestor
      const newNode = createTextNode();

      setRootNode(prev => {
        const pathInfo = findParentAndIndex(prev, selectedId!);

        if (!pathInfo) {
          console.log(`no pathToInfo. returning prev`)
          return prev;
        }

        let insertionTarget = [...pathInfo.path].reverse().find(
          node => node.type === 'inline-container'
        ) as MathNode | undefined;

        if (!insertionTarget) {
          console.log(`no insertiontarget. returning prev`)

          return prev;
        }

        let containerChildren = getLogicalChildren(insertionTarget);
        let selectedIndex = containerChildren.findIndex(c => c.id === selectedId);

        const edgeIndex = direction === 'right' ? containerChildren.length - 1 : 0;
        const edgeNode = containerChildren[edgeIndex];

        const isEmptyText = edgeNode?.type === 'text' && edgeNode.content.trim() === '';

        if (isEmptyText) {
          const parent = findParentAndIndex(prev, edgeNode.id)
          console.log(`${edgeNode.type} has ${edgeNode.id}, and parent is ${parent?.parent.id}`)
          console.log(`${parent?.path.map(nodeToString).join(", ")}`);
          //setSelectedId(parent?.path[parent.path.length - 3].id);

          const pathToNode = findPathToNode(prev, edgeNode.id)

          if (!pathToNode) { 
            console.log(`path to node ${nodeToString(edgeNode)} is null`)
            return prev;
          }

          //selectedIndex = pathToNode.findIndex(n => n.id === parent?.path[parent.path.length - 2].id);


          const reversed = [...pathToNode].reverse();
          const inlineContainers = reversed.filter(node => node.type === 'inline-container');

          if (inlineContainers.length <= 1) {
            console.log(`there are no inlinecontainers to jump up to`)
            return prev
          }
          insertionTarget = inlineContainers[1]; // Second match, if it exists
          containerChildren = getLogicalChildren(insertionTarget);

          
          selectedIndex = direction === 'right' ? containerChildren.length - 1 : 0

          // TODO FIX IT; IT IS DELETING PART OF MY FRACTION WTF
          console.log(`${selectedIndex} target ${nodeToString(insertionTarget)} in ${pathToNode.map(nodeToString).join(", ")}`)

          //return prev;
        }

        const insertAt = direction === 'right' ? selectedIndex + 1 : 0;

        const newChildren = [...containerChildren];
        newChildren.splice(insertAt, 0, newNode);

        const updatedContainer = { ...insertionTarget, children: newChildren };

        const updatedRoot = findAndUpdate(prev, insertionTarget.id, () => updatedContainer);
        setSelectedId(newNode.id);
        return updatedRoot;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedId) return;

    const updateMathNode = (append: string) => {
      setRootNode(prev =>
        findAndUpdate(prev, selectedId, node => {
          if (node.type === 'text') {
            return { ...node, content: node.content + append };
          }
          else if (node.type === 'inline-container') {
            const lastChild = node.children[node.children.length - 1];
  
            // Immediately update the last child
            const updatedContainer = {
              ...node,
              children: node.children.map(child =>
                child.id === lastChild.id && child.type === 'text'
                  ? { ...child, content: child.content + append }
                  : child
              ),
            };
  
            // Update selection to point to that child moving forward
            setSelectedId(lastChild.id);
  
            return updatedContainer;
          }
          else {
            console.log(`Woahh ${node.type} gets key ${append}`)
          }
          return node;
        })
      );
    };


    // --- Handle modifier combos first ---
    if (e.ctrlKey && e.key === '-') {
      console.log(`This should work`)
      e.preventDefault();
      setRootNode(prev => {
        const pos = findParentAndIndex(prev, selectedId);
        if (!pos || !pos.parent) return prev;

        const parent = pos.parent;
        const children = getLogicalChildren(parent);
        const currentIndex = pos.index;
        const currentNode = children[currentIndex];

        const transformed = transformToSuperscript(currentNode);
        setSelectedId(transformed.subLeft?.id ?? null);

        const updatedRoot = findAndUpdate(prev, currentNode.id, () => transformed);
        return updatedRoot;
      });
      return;
    }

    if (e.ctrlKey && e.key === '6') {
      e.preventDefault();
      setRootNode(prev => {
        const pos = findParentAndIndex(prev, selectedId);
        if (!pos || !pos.parent) return prev;

        const parent = pos.parent;
        const children = getLogicalChildren(parent);
        const currentIndex = pos.index;
        const currentNode = children[currentIndex];

        const transformed = transformToSuperscript(currentNode);
        setSelectedId(transformed.supLeft?.id ?? null);

        const updatedRoot = findAndUpdate(prev, currentNode.id, () => transformed);
        return updatedRoot;
      });
      return;
    }


    // --- Handle modifier combos first ---
    if (e.shiftKey && e.key === '_') { //_ cuz - doesnt work but I still want shift for consistency across the 4 chidlren
      console.log(`yay`)
      e.preventDefault();
      setRootNode(prev => {
        const pos = findParentAndIndex(prev, selectedId);
        if (!pos || !pos.parent) return prev;

        const parent = pos.parent;
        const children = getLogicalChildren(parent);
        const currentIndex = pos.index;
        const currentNode = children[currentIndex];

        const transformed = transformToSuperscript(currentNode);
        setSelectedId(transformed.subRight?.id ?? null);

        const updatedRoot = findAndUpdate(prev, currentNode.id, () => transformed);
        return updatedRoot;
      });
      return;
    }

    if (e.shiftKey && e.code === 'Digit6') {
      e.preventDefault();
      setRootNode(prev => {
        const pos = findParentAndIndex(prev, selectedId);
        if (!pos || !pos.parent) return prev;

        const parent = pos.parent;
        const children = getLogicalChildren(parent);
        const currentIndex = pos.index;
        const currentNode = children[currentIndex];

        const transformed = transformToSuperscript(currentNode);
        setSelectedId(transformed.supRight?.id ?? null);

        const updatedRoot = findAndUpdate(prev, currentNode.id, () => transformed);
        return updatedRoot;
      });
      return;
    }

    switch (e.key) {
      case '@': //TODO remove at the end
        console.log(nodeToLatex(rootNode));
        break;
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

      case 'ArrowRight': {
        e.preventDefault();
        handleArrowNavigation(e, 'right');
        break;
      }

      case 'ArrowLeft': {
        e.preventDefault();
        handleArrowNavigation(e, 'left');
        break;
      }

      case 'Backspace': {
        e.preventDefault();
        setRootNode(prev => {
          if (!selectedId) return prev;
      
          const nodeInfo = findParentAndIndex(prev, selectedId);
          if (!nodeInfo) return prev;
      
          const parent = nodeInfo.parent;
          const siblings = getLogicalChildren(parent);
          const currentNode = siblings[nodeInfo.index];

          if (parent.type === "fraction") {
            console.log(`IN FRACTION DEL`)
            const { numerator, denominator } = parent;
          
            let replacement: MathNode | null = null;
          
            if (currentNode.id === denominator.id) {
              replacement = numerator;
            } else if (currentNode.id === numerator.id) {
              replacement = denominator
              //TODO: change this to just keeping numerator empty cuz hard to come back from if mistake from user, atm
            }
          
            if (replacement) {
              setSelectedId(replacement.id);
              return findAndUpdate(prev, parent.id, () => replacement);
            }
          }

          if (parent.type === "subsup") {
            console.log(`IN SUBSUP BACKSPACE HANDLER`)
            const { subLeft, subRight, supLeft, supRight, base } = parent;
            console.log(nodeToLatex(parent.base))
            console.log(nodeToLatex(base))
          
          
            const allAttachmentsEmpty = [subLeft, subRight, supLeft, supRight].every(isEmptyNode)
            console.log(allAttachmentsEmpty)
          
            // If currentNode is one of the attachments and they're all empty:
            const isCurrentAttachment =
              currentNode.id === subLeft?.id ||
              currentNode.id === subRight?.id ||
              currentNode.id === supLeft?.id ||
              currentNode.id === supRight?.id;
          
            if (allAttachmentsEmpty) { // used to be this && isCurrentAttachment
              const newBase =
                base.type === "text"
                  ? base
                  : createTextNode();
          
              setSelectedId(newBase.id);

              console.log(`Hey you did something?`)
          
              return findAndUpdate(prev, parent.id, () => newBase);
            } else if (allAttachmentsEmpty) {
              // This is reached when all empty but no child selected
              console.log(nodeToLatex(parent)) 

            }
          }

          if (!currentNode) return prev;

          if (currentNode.type === "inline-container") {
            console.log(`IN CURRENTNODE=IC BACKSPACE HANDLER`)

            if (currentNode.children.every(isEmptyNode)) {
              console.log(`YES it is all empty`)
              // Delete this child
              return findAndUpdate(prev, currentNode.id, () => currentNode); 
            }
            else {
              console.log(`NO NOT ALL EMPTY: ${currentNode.children}`)
              return prev
            }
          }
      
          // Case 1: Delete last char of text
          if (currentNode.type === 'text') {
            console.log(`if this is not working then wtf`)
            const content = currentNode.content;

            if (content.length > 0) {
              console.log(`Long??!`)

              return findAndUpdate(prev, currentNode.id, node => ({
                ...node,
                content: content.slice(0, -1),
              }));
            }
            else { // Check if empty string
              console.log(`I know the current node is empty...`)
            }
      
            // Don't delete if it's the only node in root container
            const isRootContainer = prev.id === parent.id && siblings.length === 1;
            if (isRootContainer) {
              console.log(`tryna delete the root container`)
              return prev;
            }
      
            const index = nodeInfo.index;
            const updatedSiblings = [...siblings];
            updatedSiblings.splice(index, 1);
      
            const newSelectedLeaf = getPreviousLeaf(prev, currentNode.id);
            if (newSelectedLeaf) {
              console.log(`Ya got here?`)
              setSelectedId(newSelectedLeaf.id);
            } else {
              console.log(`Ya got here in else?`)
              setSelectedId(parent.id); // fallback
            }
      
            const updatedParent = {
              ...parent,
              children: updatedSiblings,
            };
      
            return findAndUpdate(prev, parent.id, () => updatedParent);
          }
      
          // If non-text leaf selected, move left
          const previousLeaf = getPreviousLeaf(prev, selectedId);
          if (previousLeaf) {
            setSelectedId(previousLeaf.id);
          }
          return prev;
        });
        break;
      }

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
