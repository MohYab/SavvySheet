import React, { useRef, useCallback, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import type { ColDef, GridApi, GetRowIdParams } from 'ag-grid-community';
import type { EditableTableProps, ExcelRow } from '@types';
import { isEqual } from '@utils';
import ExportButton from '@components/Export/ExportButton';
import UndoRedoButtons from 'components/Sheet/UndoRedoButtons'; // Import UndRedo buttons
import { useUndoRedo } from 'hooks/useUndoRedo'; // Import custom undo/redo hook

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const DEBOUNCE_MS = 250; // debounce delay in milliseconds

const EditableTable: React.FC<EditableTableProps> = ({ data, dataOnChange }) => {
  const apiRef = useRef<GridApi | null>(null);
  const [quickFilter, setQuickFilter] = useState('');
  const [selected, setSelected] = useState(0);

  // Initialize Undo/Redo state using a custom hook
  const { state, set, undo, redo, canUndo, canRedo } = useUndoRedo(data);

  // Ensure stable row data with unique IDs (__rowId)
  const rowDataForGrid: (ExcelRow & { __rowId: string })[] = useMemo(() => {
    return state.map((row, idx) => ({ __rowId: `r_${idx}`, ...row }));
  }, [state]);

  // Define AG Grid column definitions
  const colDefs: ColDef[] = useMemo(() => {
    if (!rowDataForGrid.length) return [];
    return Object.keys(rowDataForGrid[0])
      .filter((key) => key !== '__rowId')
      .map((key) => ({
        field: key,
        headerName: key,
        editable: true,
        sortable: true,
        filter: true,
        resizable: true,
      }));
  }, [rowDataForGrid]);

  // Collects the data from the grid for saving
  const collectData = useCallback((): ExcelRow[] => {
    const api = apiRef.current;
    if (!api) return state;
    const rows: ExcelRow[] = [];
    api.forEachNode((node) => {
      if (!node.data) return;
      const cleanRow = Object.fromEntries(
        Object.entries(node.data).filter(([key]) => !key.startsWith('__')),
      );
      rows.push(cleanRow as ExcelRow);
    });
    return rows;
  }, [state]);

  const doSave = useCallback(() => {
    const updated = collectData();
    if (!isEqual(updated, state)) {
      set(updated); // Update Undo/Redo state
      dataOnChange(updated); // Trigger parent callback
    }
  }, [collectData, dataOnChange, set, state]);

  // Debounced save function for minimal re-renders
  const debouncedSave = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(doSave, DEBOUNCE_MS);
    };
  }, [doSave]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Snabbfilter..."
            className="input input-sm input-bordered"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            aria-label="Snabbfilter"
          />
          <span className="text-xs opacity-70">
            Valda: {selected} / {rowDataForGrid.length}
          </span>
        </div>
        <ExportButton
          data={rowDataForGrid.map(({ __rowId, ...rest }) => rest)}
          filenameBase="sheet"
          variant="both"
        />
      </div>

      <UndoRedoButtons onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />

      {rowDataForGrid.length === 0 ? (
        <div className="border border-dashed p-8 text-center italic opacity-70">
          Ingen data tillgänglig.
        </div>
      ) : (
        <div className="ag-theme-alpine w-full" style={{ height: 'calc(100vh - 300px)' }}>
          <AgGridReact
            theme={themeAlpine}
            rowData={rowDataForGrid}
            columnDefs={colDefs}
            rowSelection="multiple"
            suppressRowClickSelection={false}
            animateRows
            quickFilterText={quickFilter}
            onGridReady={(params) => {
              apiRef.current = params.api;
              params.api.sizeColumnsToFit();
              setSelected(params.api.getSelectedNodes().length);
            }}
            onSelectionChanged={() => setSelected(apiRef.current?.getSelectedNodes().length ?? 0)}
            onCellValueChanged={debouncedSave}
            onCellEditingStopped={debouncedSave}
            onPasteEnd={debouncedSave}
            onSortChanged={debouncedSave}
            getRowId={(params: GetRowIdParams) =>
              String((params.data as { __rowId?: string }).__rowId ?? '')
            }
          />
        </div>
      )}
    </div>
  );
};

export default EditableTable;
