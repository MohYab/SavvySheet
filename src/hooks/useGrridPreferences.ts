/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import type { GridApi, ColumnState } from 'ag-grid-community';

interface GridPreferences {
  columnState?: ColumnState[];
  sortModel?: unknown;
}

const KEY_PREFIX = 'savvysheet-grid-';

export function useGridPreferences(gridId: string, api?: GridApi | null) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!api || loadedRef.current) return;

    try {
      const raw = localStorage.getItem(KEY_PREFIX + gridId);
      if (raw) {
        const prefs: GridPreferences = JSON.parse(raw);
        if (prefs.columnState && api.applyColumnState) {
          api.applyColumnState({ state: prefs.columnState, applyOrder: true });
        }
        if (prefs.sortModel && (api as any).setSortModel) {
          (api as any).setSortModel(prefs.sortModel);
        }
      }
    } catch (e) {
      console.warn('Kunde inte ladda gridpreferenser', e);
    }
    loadedRef.current = true;
  }, [gridId, api]);

  const persist = () => {
    if (!api) return;
    const prefs: GridPreferences = {
      columnState: api.getColumnState ? api.getColumnState() : undefined,
      sortModel: (api as any).getSortModel ? (api as any).getSortModel() : undefined,
    };
    localStorage.setItem(KEY_PREFIX + gridId, JSON.stringify(prefs));
  };

  return { persist };
}
