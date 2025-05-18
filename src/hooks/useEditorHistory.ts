import { useState } from "react";
import type { EditorState } from "../logic/editor-state";
import type { HistoryState } from "../logic/history";

export function useEditorHistory(initialState: EditorState) {
    const [history, setHistory] = useState<HistoryState>({
      past: [],
      present: initialState,
      future: [],
    });
  
    function update(newState: EditorState) {
      setHistory(prev => ({
        past: [...prev.past, prev.present],
        present: newState,
        future: [],
      }));
    }
  
    function undo() {
      setHistory(prev => {
        if (prev.past.length === 0) return prev;
  
        const previous = prev.past[prev.past.length - 1];
        const newPast = prev.past.slice(0, -1);
  
        return {
          past: newPast,
          present: previous,
          future: [prev.present, ...prev.future],
        };
      });
    }
  
    function redo() {
      setHistory(prev => {
        if (prev.future.length === 0) return prev;
  
        const next = prev.future[0];
        const newFuture = prev.future.slice(1);
  
        return {
          past: [...prev.past, prev.present],
          present: next,
          future: newFuture,
        };
      });
    }
  
    return { state: history.present, update, undo, redo };
  }