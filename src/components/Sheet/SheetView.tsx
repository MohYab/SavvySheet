import EditableTable from './EditableTable';
import type { ExcelRow, ExportColumn } from '@types';

interface SheetViewProps {
  sheetName: string;
  data: ExcelRow[];
  onDataChange: (newData: ExcelRow[]) => void;
  columns: ExportColumn<ExcelRow>[]; // (Behåll om export senare per-blad)
  originalFileName?: string;
}

const SheetView: React.FC<SheetViewProps> = ({ sheetName, data, onDataChange }) => {
  return (
    <div className="pt-2">
      <h2 className="text-xl font-bold mb-2">{sheetName}</h2>
      <EditableTable data={data} dataOnChange={onDataChange} />
    </div>
  );
};

export default SheetView;
