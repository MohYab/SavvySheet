import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridApi } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import { isEqual, getColumnDefs } from '@utils';
import type { EditableTableProps, ExcelRow } from '@types';
import { useUndoRedo } from 'hooks/useUndoRedo';
import UndoRedoButtons from './UndoRedoButtons';

ModuleRegistry.registerModules([AllCommunityModule]);

const EditableTable: React.FC<EditableTableProps> = ({ data, dataOnChange }) => {
  const gridApiRef = useRef<GridApi | null>(null);

  // History hook for undo/redo. Initialize with incoming prop data.
  const {
    state: tableData,
    set: setTableData,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useUndoRedo<ExcelRow[]>(data);

  // Skip calling dataOnChange when resetting from external prop changes
  const skipOnChangeRef = useRef<boolean>(true);

  // When parent 'data' prop changes (e.g. upload / external update), reset history and skip emitting change.
  useEffect(() => {
    reset(data);
    skipOnChangeRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Whenever the internal tableData changes (user edit / undo / redo), propagate to parent,
  // except when we intentionally skip after external resets.
  useEffect(() => {
    if (skipOnChangeRef.current) {
      skipOnChangeRef.current = false;
      return;
    }
    dataOnChange(tableData);
  }, [tableData, dataOnChange]);

  // compute column defs from current tableData so grid updates when columns change
  const colDefs: ColDef[] = useMemo(() => getColumnDefs(tableData), [tableData]);

  const saveData = useCallback(() => {
    if (!gridApiRef.current) return;
    gridApiRef.current.stopEditing();

    const updatedData: ExcelRow[] = [];
    gridApiRef.current.forEachNode((node) => {
      const row: ExcelRow = {};
      Object.entries(node.data as Record<string, unknown>).forEach(([key, value]) => {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          value === null
        ) {
          row[key] = value;
        } else {
          row[key] = String(value);
        }
      });
      updatedData.push(row);
    });

    if (!isEqual(updatedData, tableData)) {
      // Mark that this change originates locally (don't skip propagation)
      skipOnChangeRef.current = false;
      setTableData(updatedData); // push new snapshot to history
      // dataOnChange will be called via the tableData effect
    }
  }, [setTableData, tableData]);

  // Keyboard shortcuts for Undo/Redo: Ctrl/Cmd+Z and Ctrl/Cmd+Y
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return (
    <div className="w-full h-full">
      {tableData.length === 0 ? (
        <div className="flex items-center justify-center h-full rounded-md text-gray-600 italic border-2 border-gray-400">
          Ingen fil uppladdad än!
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <UndoRedoButtons onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
          </div>

          <div
            onMouseLeave={saveData}
            className="w-full h-full"
            style={{ height: 'calc(100vh - 250px)' }}
          >
            <div className="ag-theme-alpine w-full h-full">
              <AgGridReact
                rowData={tableData}
                theme={themeAlpine}
                columnDefs={colDefs}
                onGridReady={(params) => {
                  gridApiRef.current = params.api as GridApi;
                }}
                onCellValueChanged={saveData}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditableTable;
