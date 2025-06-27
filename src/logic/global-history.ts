// import type { EditorState } from "./editor-state";

// // logic/global-history.ts
// export interface EditorSnapshot {
//   states: Record<string, EditorState>;
//   order: string[];
// }

// export interface HistoryState {
//   past: EditorSnapshot[];
//   present: EditorSnapshot;
//   future: EditorSnapshot[];
// }

// // export interface HistoryState<T> {
// //     past: T[];
// //     present: T;
// //     future: T[];
// //   }
  
//   // export function createInitialHistory<T>(initial: T): HistoryState<T> {
//   //   return {
//   //     past: [],
//   //     present: initial,
//   //     future: [],
//   //   };
//   // }
//   export function createInitialHistory(initial: EditorSnapshot): HistoryState {
//     return {
//       past: [],
//       present: initial,
//       future: [],
//     };
//   }
  
//   // export function applyUpdate<T>(history: HistoryState<T>, newState: T): HistoryState<T> {
//   //   return {
//   //     past: [...history.past, history.present],
//   //     present: newState,
//   //     future: [],
//   //   };
//   // }
  
//   // export function undo<T>(history: HistoryState<T>): HistoryState<T> {
//   //   if (history.past.length === 0) return history;
//   //   const previous = history.past[history.past.length - 1];
//   //   return {
//   //     past: history.past.slice(0, -1),
//   //     present: previous,
//   //     future: [history.present, ...history.future],
//   //   };
//   // }
  
//   // export function redo<T>(history: HistoryState<T>): HistoryState<T> {
//   //   if (history.future.length === 0) return history;
//   //   const next = history.future[0];
//   //   return {
//   //     past: [...history.past, history.present],
//   //     present: next,
//   //     future: history.future.slice(1),
//   //   };
//   // }
  
//   export function applyUpdate(history: HistoryState, newSnapshot: EditorSnapshot): HistoryState {
//     return {
//       past: [...history.past, history.present],
//       present: newSnapshot,
//       future: [],
//     };
//   }
  
//   export function undo(history: HistoryState): HistoryState {
//     if (history.past.length === 0) return history;
//     const previous = history.past[history.past.length - 1];
//     return {
//       past: history.past.slice(0, -1),
//       present: previous,
//       future: [history.present, ...history.future],
//     };
//   }
  
//   export function redo(history: HistoryState): HistoryState {
//     if (history.future.length === 0) return history;
//     const next = history.future[0];
//     return {
//       past: [...history.past, history.present],
//       present: next,
//       future: history.future.slice(1),
//     };
//   }

// logic/global-history.ts
import type { EditorState } from "./editor-state";

export interface EditorSnapshot {
  states: Record<string, EditorState>;
  order: string[]; // the order of cell IDs
}

export interface HistoryState {
  past: EditorSnapshot[];
  present: EditorSnapshot;
  future: EditorSnapshot[];
}

export function createInitialHistory(initial: EditorSnapshot): HistoryState {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function applyUpdate(history: HistoryState, newSnapshot: EditorSnapshot): HistoryState {
  return {
    past: [...history.past, history.present],
    present: newSnapshot,
    future: [],
  };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];

  const numCells = previous.order.length;
  const cellIds = previous.order.join(", ");
  console.log(`Undoing to state with ${numCells} cells: [${cellIds}]`);
  
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}
