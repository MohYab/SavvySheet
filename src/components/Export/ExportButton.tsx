import { DocumentArrowDownIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { exportToPdf } from 'utils/exportPdf';
import { exportToExcel } from 'utils/exportExcel';
import type { jsPDF as JsPDFInstance } from 'jspdf';
import type { UserOptions } from 'jspdf-autotable';

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filenameBase: string;
  onAfterExport?: () => void;
  columnsOrder?: string[];
  variant?: 'pdf' | 'excel' | 'both';
}

type AutoTable = (doc: JsPDFInstance, options: UserOptions) => JsPDFInstance;

function ExportButton<T extends Record<string, unknown>>({
  data,
  filenameBase,
  onAfterExport,
  columnsOrder,
  variant = 'both',
}: ExportButtonProps<T>) {
  const doPdf = async () => {
    if (data.length === 0) return alert('Ingen data att exportera.');
    await exportToPdf({
      data,
      columns: columnsOrder,
      filename: `${filenameBase}-savvysheet.pdf`,
      title: filenameBase,
    });
    onAfterExport?.();
  };

  const doExcel = () => {
    if (data.length === 0) return alert('Ingen data att exportera.');
    exportToExcel({
      data,
      filename: `${filenameBase}-savvysheet.xlsx`,
      sheetName: 'Data',
    });
    onAfterExport?.();
  };

  return (
    <div className="flex gap-2">
      {(variant === 'pdf' || variant === 'both') && (
        <button
          type="button"
          onClick={doPdf}
          className="btn btn-outline btn-primary"
          aria-label="Exportera som PDF"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          PDF
        </button>
      )}
      {(variant === 'excel' || variant === 'both') && (
        <button
          type="button"
          onClick={doExcel}
          className="btn btn-outline btn-secondary"
          aria-label="Exportera som Excel"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          Excel
        </button>
      )}
      {(variant === 'pdf' || variant === 'both') && (
        <button
          type="button"
          onClick={async () => {
            if (data.length === 0) return;

            // Dynamiska importer med tydliga typer
            const [{ default: jsPDF }, autoTableModule] = await Promise.all([
              import('jspdf'),
              import('jspdf-autotable'),
            ]);
            const autoTable = (autoTableModule as unknown as { default: AutoTable }).default;

            const doc = new jsPDF();

            // Typa kolumnnycklarna som Array<keyof T> (undviker any)
            const cols = (columnsOrder ?? Object.keys(data[0] as T)) as Array<keyof T>;

            // Indexera raderna via keyof T
            const body = data.map((row) => cols.map((key) => String(row[key] ?? '')));

            const options: UserOptions = {
              head: [cols as unknown as string[]],
              body,
              startY: 16,
            };

            autoTable(doc, options);
            const blobUrl = doc.output('bloburl');
            window.open(blobUrl, '_blank');
          }}
          className="btn btn-outline"
          aria-label="Visa PDF"
        >
          <DocumentMagnifyingGlassIcon className="w-5 h-5" />
          Förhandsvisa
        </button>
      )}
    </div>
  );
}

export default ExportButton;
