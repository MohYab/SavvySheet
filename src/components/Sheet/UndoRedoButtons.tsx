import React from 'react';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';

type Props = {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export const UndoRedoButtons: React.FC<Props> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="undo-btn flex items-center gap-2 px-3 py-1.5 rounded-md"
        aria-label="Ångra"
        title="Ångra (Ctrl+Z)"
      >
        <ArrowUturnLeftIcon className="w-4 h-4 text-gray-200" />
        <span className="text-sm text-gray-200">Ångra</span>
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="undo-btn flex items-center gap-2 px-3 py-1.5 rounded-md"
        aria-label="Gör om"
        title="Gör om (Ctrl+Y)"
      >
        <ArrowUturnRightIcon className="w-4 h-4 text-gray-200" />
        <span className="text-sm text-gray-200">Gör om</span>
      </button>
    </div>
  );
};

export default UndoRedoButtons;
