import { useState } from "react";
import type { EditorState } from "../logic/editor-state";
import { deleteNodeById, insertNodeAtIndex } from "../logic/node-manipulation";
import { findNodeById, findParentContainerAndIndex, getLogicalChildren } from "../utils/treeUtils";

export interface DragState {
  draggedNodeId: string | null;
  dropTargetId: string | null;
  dropTargetIndex: number | null;
}

export function useDragState(
  editorStateRef: React.RefObject<EditorState>,
  updateEditorState: (newState: EditorState) => void
) {
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  function startDrag(nodeId: string) {
    setDraggedNodeId(nodeId);
    setDropTargetId(null);
    setDropTargetIndex(null);
  }

  function updateDropTarget(targetId: string, targetIndex: number) {
    setDropTargetId(targetId);
    setDropTargetIndex(targetIndex);
  }

  function handleDrop() {
    const editorState = editorStateRef.current;
  
    if (!draggedNodeId || !dropTargetId || dropTargetIndex === null) {
      clearDrag();
      return;
    }
  
    const draggedNode = findNodeById(editorState.rootNode, draggedNodeId);
    if (!draggedNode) {
      clearDrag();
      return;
    }
  
    // Step 1: Remove dragged node from its original place
    let newState = deleteNodeById(editorState, draggedNodeId);
  
    // Step 2: Resolve target node *in the new state*, post-removal
    const dropTargetNode = findNodeById(newState.rootNode, dropTargetId);
  
    if (!dropTargetNode) {
      console.warn(`Drop target node not found: ${dropTargetId}`);
      clearDrag();
      return;
    }
  
    // Step 3: Handle special case: dropping into a container
    if (dropTargetNode.type === "inline-container") {
      // Safeguard against self-drop
      if (
        draggedNode.id === dropTargetNode.id ||
        getLogicalChildren(draggedNode).includes(dropTargetNode)
      ) {
        console.warn("Cannot drop into self or own child.");
        clearDrag();
        return;
      }
  
      // Insert as first child of the container
      newState = insertNodeAtIndex(newState, dropTargetNode.id, 0, draggedNode);
  
      updateEditorState({
        ...newState,
        // Replace updated container directly
        rootNode: JSON.parse(JSON.stringify(newState.rootNode)), // force re-render
      });
  
      clearDrag();
      return;
    }
  
    // Step 4: Drop as sibling (insert at index in parent container)
    const containerInfo = findParentContainerAndIndex(newState.rootNode, dropTargetId);
    if (!containerInfo) {
      console.warn(`No parent container found for: ${dropTargetId}`);
      clearDrag();
      return;
    }
  
    const { container } = containerInfo;
  
    if (
      draggedNode.id === container.id ||
      getLogicalChildren(draggedNode).includes(container)
    ) {
      console.warn("Cannot drop into self or own descendant.");
      clearDrag();
      return;
    }
  
    newState = insertNodeAtIndex(newState, container.id, dropTargetIndex, draggedNode);
    updateEditorState(newState);
    clearDrag();
  }
  

  function clearDrag() {
    setDraggedNodeId(null);
    setDropTargetId(null);
    setDropTargetIndex(null);
  }

  return {
    draggedNodeId,
    dropTargetId,
    dropTargetIndex,
    startDrag,
    updateDropTarget,
    handleDrop,
    clearDrag,
  };
}
