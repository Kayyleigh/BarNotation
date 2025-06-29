// components/mathLibrary/MathLibrary.tsx
import React, { useEffect, useState } from "react";
import ResizableSidebar from "../layout/ResizableSidebar";
import type { MathNode, StructureNode } from "../../models/types";
import styles from "./MathLibrary.module.css";
import type { LibraryEntry } from "../../models/libraryTypes";
import { MathView } from "../mathExpression/MathView";
import { parseLatex } from "../../models/mathNodeParser";
import { useDragContext } from "../../hooks/useDragContext";
import { nodeToLatex } from "../../models/nodeToLatex";
import { createInlineContainer, createRootWrapper } from "../../models/nodeFactories";

type DropSource = {
  sourceType: "cell" | "library";
  cellId?: string;
  containerId: string;
  index: number;
  node: MathNode;
};

type DropTarget = {
  cellId: string;
  containerId: string;
  index: number;
};

interface MathLibraryProps {
  width: number;
  onWidthChange: (width: number) => void;
  onDropNode: (from: DropSource, to: DropTarget) => void;
  addEntryRef?: React.RefObject<(entry: LibraryEntry) => void>;
}

const STORAGE_KEY = "mathLibrary";

const MathLibrary: React.FC<MathLibraryProps> = ({ width, onWidthChange, onDropNode, addEntryRef }) => {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const { draggingNode, setDraggingNode, setDropTarget } = useDragContext();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEntries(parsed);
      } catch (e) {
        console.warn("Failed to parse math library from storage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (addEntryRef) {
      addEntryRef.current = (entry: LibraryEntry) => {
        setEntries((prev) => [...prev, entry]);
      };
    }
  }, [addEntryRef]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <ResizableSidebar
      side="right"
      title="Math Library"
      width={width}
      onWidthChange={onWidthChange}
      storageKey="mathLibraryWidth"
    >
      <div
        className={styles.libraryDropZone}
        onDragOver={(e) => {
          e.preventDefault();
          setDropTarget({
            cellId: "library",
            containerId: "library",
            index: entries.length, // drop to end
          });
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (draggingNode) {
            onDropNode(draggingNode, {
              cellId: "library",
              containerId: "library",
              index: entries.length,
            });
            setDraggingNode(null);
            setDropTarget(null);
            return;
          }

          // Fallback for text/plain or legacy drops (e.g. LaTeX string)
          try {
            const latex = e.dataTransfer.getData("text/plain");
            if (latex) {
              const node = parseLatex(latex);
              if (node) {
                const newEntry = {
                  id: crypto.randomUUID(),
                  node,
                };
                setEntries((prev) => [...prev, newEntry]);
              }
            }
          } catch (err) {
            console.warn("Failed to parse fallback LaTeX drop data", err);
          }
        }}
      >
        {entries.length === 0 && (
          <p className={styles.empty}>Drag math expressions here!</p>
        )}

        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className={styles.libraryEntry}
            draggable
            onDragStart={(e) => {
              const dragData: DropSource = {
                sourceType: "library",
                containerId: "library",
                index: idx,
                node: entry.node,
              };

              // Internal use
              setDraggingNode(dragData);
              e.dataTransfer.effectAllowed = "copyMove";

              // External drag support: provide LaTeX version
              try {
                  // RECOVER THIS IF I DECIDE THAT "LATEX VERSION" REQUIRES THE BLOCK WRAP `\[ ... \]`
                  // const rootWrappedNode = (entry.node.type === "inline-container") 
                  //   ? createRootWrapper(entry.node)
                  //   : createRootWrapper(createInlineContainer([entry.node as StructureNode]))
                  // const latex = nodeToLatex(rootWrappedNode);
                  const latex = nodeToLatex(entry.node)
                  e.dataTransfer.setData("text/plain", latex);
                } catch (err) {
                  console.warn("Failed to convert node to LaTeX during drag:", err);
                }
            }}
            onDragEnd={() => {
              setDraggingNode(null);
              setDropTarget(null);
            }}
          >
            <MathView node={entry.node} />
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(entry.id)}
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ResizableSidebar>
  );
};

export default MathLibrary;
