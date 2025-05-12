import type { MathUnit } from '../types/MathUnit';

export interface EditorState {
  root: MathUnit;
  selectedId: string | null;
  cursorIndex?: number; // relevant if inside a group
}

export type EditorAction =
  | { type: 'insert_char'; char: string }
  | { type: 'move_cursor'; direction: 'left' | 'right' }
  | { type: 'select'; id: string };

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'insert_char':
      // Handle tree update
      return state;

    case 'move_cursor':
      // Move cursor logic
      return state;

    case 'select':
      return { ...state, selectedId: action.id };

    default:
      return state;
  }
}
