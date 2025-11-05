import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SheetData, ExcelRow, ExportColumn } from '@types';
import ExportButton from '@components/Export/ExportButton';
import UndoRedoButtons from '../Sheet/UndoRedoButtons';

interface HeaderProps {
  sheets: SheetData;
  columns: ExportColumn<ExcelRow>[];
  filename?: string;
  // optional callbacks from parent (undo/redo functions can be passed down if needed)
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  sheets,
  columns,
  filename,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const navigate = useNavigate();
  const hasData = Object.keys(sheets).length > 0;

  const handleNewFile = () => {
    navigate('/');
  };

  // simple theme toggle using daisyUI classes on html tag
  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'synthwave';
    html.setAttribute('data-theme', current === 'synthwave' ? 'light' : 'synthwave');
  };

  return (
    <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <img src="logo.webp" alt="Logo" className="h-12 w-12 rounded-md shadow-sm" />
        <div>
          <h1 className="text-2xl md:text-3xl font-grand-hotel leading-none">SavvySheet</h1>
          <p className="text-sm text-gray-400">{filename ?? 'Ingen fil'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {hasData && (
          <div className="flex items-center gap-3">
            {/* ExportButton expects data/columns props; pass them from parent when used */}
            <ExportButton
              data={[]}
              columns={columns}
              originalFileName={filename}
              onDownload={() => {}}
              onShow={() => {}}
            />
            <UndoRedoButtons
              onUndo={onUndo ?? (() => {})}
              onRedo={onRedo ?? (() => {})}
              canUndo={!!canUndo}
              canRedo={!!canRedo}
            />
          </div>
        )}

        <button onClick={toggleTheme} className="btn btn-ghost btn-sm" title="Toggle theme">
          Tema
        </button>

        <button onClick={handleNewFile} className="btn btn-outline btn-sm">
          Ny fil
        </button>
      </div>
    </header>
  );
};

export default Header;
