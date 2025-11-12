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
 * Custom hook for managing undo/redo state history.
 */
export function useUndoRedo<T>(initialPresent: T) {
  const [state, dispatch] = useReducer(undoRedoReducer, {
    past: [],
    present: initialPresent,
    future: [],
  });

  const set = useCallback((newPresent: T) => dispatch({ type: 'SET', payload: newPresent }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const reset = useCallback(
    (initialValue: T) => dispatch({ type: 'RESET', payload: initialValue }),
    [],
  );

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    reset,
  };
}
