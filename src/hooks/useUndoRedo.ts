import { useCallback, useReducer } from 'react';

type State<T> = {
  past: T[];
  present: T;
  future: T[];
};

type Action<T> =
  | { type: 'SET'; payload: T }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; payload: T };

function undoRedoReducer<T>(state: State<T>, action: Action<T>): State<T> {
  const { past, present, future } = state;
  switch (action.type) {
    case 'SET': {
      return {
        past: [...past, present],
        present: action.payload,
        future: [],
      };
    }
    case 'UNDO': {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }
    case 'REDO': {
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }
    case 'RESET': {
      return {
        past: [],
        present: action.payload,
        future: [],
      };
    }
    default:
      return state;
  }
}

/**
 * useUndoRedo - simple history hook for undo/redo operations.
 * initialPresent should be the initial value (e.g. initial rows array).
 */
export function useUndoRedo<T>(initialPresent: T) {
  const initialState: State<T> = { past: [], present: initialPresent, future: [] };

  // We cast reducer to React.Reducer via unknown to avoid using `any` while keeping typing.
  const [state, dispatch] = useReducer(
    undoRedoReducer as unknown as React.Reducer<State<T>, Action<T>>,
    initialState,
  );

  const set = useCallback((newPresent: T) => dispatch({ type: 'SET', payload: newPresent }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const reset = useCallback((value: T) => dispatch({ type: 'RESET', payload: value }), []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
