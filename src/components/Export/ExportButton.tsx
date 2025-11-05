import { DocumentArrowDownIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { ExportColumn } from '@types';
import { exportToExcel, getExcelFilename } from '../../utils/exportExcel';

interface ExportButtonProps<T extends Record<string, unknown> & { SheetName?: string }> {
  data: T[];
  columns: ExportColumn<T>[];
  originalFileName?: string;
  onDownload?: () => void; // PDF download handler
  onShow?: () => void; // visa PDF
}

function ExportButton<T extends Record<string, unknown> & { SheetName?: string }>({
  onDownload,
  onShow,
  data,
  columns,
  originalFileName,
}: ExportButtonProps<T>) {
  const handleExcelDownload = async () => {
    // Filnamn med suffix
    const filename = getExcelFilename(originalFileName);
    // Exportera med ExcelJS
    try {
      await exportToExcel({ filename, columns, data });
    } catch (err) {
      console.error('Excel export failed', err);
      alert('Kunde inte exportera till Excel. Kolla konsolen för fel.');
    }
  };

  return (
    <div className="export-section flex flex-col gap-2">
      <div className="flex gap-2">
        <button type="button" onClick={handleExcelDownload} className="btn btn-outline btn-success">
          <DocumentArrowDownIcon />
          Ladda ner Excel
        </button>

        <button type="button" onClick={onDownload} className="btn btn-outline btn-primary">
          <DocumentArrowDownIcon />
          Ladda ner PDF
        </button>

        <button type="button" onClick={onShow} className="btn btn-outline btn-secondary">
          <DocumentMagnifyingGlassIcon />
          Visa PDF
        </button>
      </div>
    </div>
  );
}

export default ExportButton;
