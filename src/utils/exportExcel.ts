import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ExportColumn } from '@types';

/**
 * Best-effort: hämtar ett kolumn-nyckel-namn från olika möjliga property-namn
 * (field, key). Returns undefined om ingen nyckel finns.
 */
function getColumnKey(col: Record<string, unknown>, _fallbackIndex: number): string | undefined {
  return (
    (col.field as string) ??
    (col.key as string) ??
    // some column defs may only have headerName; fallback to index-based access
    undefined
  );
}

function getColumnHeader(col: Record<string, unknown>, fallbackIndex: number): string {
  return (
    (col.header as string) ??
    (col.headerName as string) ??
    (col.field as string) ??
    (col.key as string) ??
    `Column ${fallbackIndex + 1}`
  );
}

export function getExcelFilename(originalFileName?: string) {
  if (!originalFileName) return 'table-savvysheet.xlsx';
  const dotIndex = originalFileName.lastIndexOf('.');
  const basename = dotIndex > 0 ? originalFileName.substring(0, dotIndex) : originalFileName;
  return `${basename}-savvysheet.xlsx`;
}

/**
 * Export to .xlsx using ExcelJS.
 * - columns may come from getColumnDefs (which uses 'field') or other shapes.
 * - We treat each column as Record<string, unknown> to avoid assuming specific props.
 */
export async function exportToExcel<T extends Record<string, unknown>>(options: {
  filename?: string;
  columns: ExportColumn<T>[]; // handled as Record<string, unknown> internally
  data: T[];
}) {
  const { filename = 'export.xlsx', columns, data } = options;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  // Header row: infer header from column definition (header/headerName/field/key)
  const headerRow = columns.map((col, idx) =>
    getColumnHeader(col as unknown as Record<string, unknown>, idx),
  );
  worksheet.addRow(headerRow);

  // Data rows
  data.forEach((row) => {
    const rowValues = columns.map((col, idx) => {
      const colRec = col as unknown as Record<string, unknown>;
      const key = getColumnKey(colRec, idx);

      let cellValue: unknown;
      if (key && Object.prototype.hasOwnProperty.call(row, key)) {
        cellValue = row[key];
      } else {
        // If no key, try to map by header position: use nth property of row
        const rowKeys = Object.keys(row);
        const fallbackKey = rowKeys[idx];
        cellValue = fallbackKey ? row[fallbackKey] : '';
      }

      if (cellValue instanceof Date) return cellValue;
      if (typeof cellValue === 'number') return cellValue;
      if (typeof cellValue === 'boolean') return cellValue ? 'TRUE' : 'FALSE';
      if (cellValue === null || cellValue === undefined) return '';
      return String(cellValue);
    });
    worksheet.addRow(rowValues);
  });

  // Auto width heuristic
  worksheet.columns.forEach((col) => {
    let maxLength = 10;
    (col.values || []).forEach((v: unknown) => {
      const len = v ? String(v).length : 0;
      if (len > maxLength) maxLength = len;
    });
    col.width = Math.min(60, maxLength + 2);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
}
