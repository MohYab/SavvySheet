import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SheetData, ExcelRow } from '@types';
import DropDown from './DropDown';

interface HeaderProps {
  sheets: SheetData;
  filename?: string;
}

const Header: React.FC<HeaderProps> = ({ sheets, filename }) => {
  const navigate = useNavigate();
  const hasData = Object.keys(sheets).length > 0;

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center px-4 py-3 border-b border-base-300 bg-base-100/80 backdrop-blur">
      <div className="flex items-center gap-4">
        <img src="/logo.webp" alt="Logo" className="h-12 w-12 rounded-md" />
        <div>
          <h1 className="text-3xl font-grand-hotel leading-none">SavvySheet</h1>
          <p className="text-xs opacity-70">{filename ?? 'Ingen fil'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hasData && (
          <DropDown
            sheets={sheets as Record<string, ExcelRow[]>}
            filename={filename}
            onUploadNewFile={() => navigate('/')}
          />
        )}
        <button
          onClick={() => {
            document.documentElement.setAttribute(
              'data-theme',
              document.documentElement.getAttribute('data-theme') === 'synthwave'
                ? 'light'
                : 'synthwave',
            );
          }}
          className="btn btn-ghost btn-sm"
        >
          Tema
        </button>
      </div>
    </header>
  );
};

export default Header;
