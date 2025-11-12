import { useState, useMemo } from 'react';
import { ChevronDownIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import type { SheetData, ExcelRow } from '@types';
import ExportButton from '@components/Export/ExportButton';

interface DropDownProps {
  sheets: SheetData;
  filename?: string;
  onUploadNewFile: () => void;
}

export default function DropDown({ sheets, filename, onUploadNewFile }: DropDownProps) {
  const [open, setOpen] = useState(false);

  const flatData: (ExcelRow & { SheetName: string })[] = useMemo(() => {
    return Object.entries(sheets).flatMap(([name, rows]) =>
      rows.map((r) => ({ SheetName: name, ...r })),
    );
  }, [sheets]);

  if (!flatData.length) return null;

  const filenameBase = filename?.replace(/\.[^.]+$/, '') || 'export';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary inline-flex items-center"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Meny <ChevronDownIcon className="ml-1 w-5 h-5" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-md shadow-lg z-30 bg-base-100 border border-base-200 p-3 space-y-3"
          role="menu"
        >
          <ExportButton
            data={flatData}
            filenameBase={filenameBase}
            variant="both"
            onAfterExport={() => setOpen(false)}
          />
          <button
            onClick={() => {
              onUploadNewFile();
              setOpen(false);
            }}
            className="flex w-full gap-2 px-4 py-2 btn btn-outline"
          >
            <ArrowUpTrayIcon className="w-5 h-5" /> Ladda upp ny fil
          </button>
        </div>
      )}
    </div>
  );
}
