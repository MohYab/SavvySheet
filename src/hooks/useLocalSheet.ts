import { useEffect, useRef } from 'react';

/**
 * Custom hook för att spara och ladda sheets-data till lokal lagring.
 */
function useLocalSheet<T extends Record<string, unknown> | unknown[]>(
  sheetData: T,
  setSheetData: (d: T) => void,
  filename?: string,
  setFilename?: (f: string) => void,
  key = 'savvySheetData',
  filenameKey = 'savvySheetFilename',
) {
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (typeof localStorage === 'undefined') {
      console.error(
        'localStorage is not supported in this environment. Skipping sheet data loading.',
      );
      return;
    }

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: T = JSON.parse(saved);
        setSheetData(parsed);
      }

      if (setFilename) {
        const savedFilename = localStorage.getItem(filenameKey);
        if (savedFilename) setFilename(savedFilename);
      }
    } catch (e) {
      console.error('Failed to parse saved sheets', e);
    }

    hasLoaded.current = true;
  }, [key, filenameKey, setSheetData, setFilename]);

  useEffect(() => {
    if (!hasLoaded.current || typeof localStorage === 'undefined') return;

    const isEmptyData =
      (Array.isArray(sheetData) && sheetData.length === 0) ||
      (!Array.isArray(sheetData) && Object.keys(sheetData).length === 0);

    if (isEmptyData) return;

    const save = () => {
      localStorage.setItem(key, JSON.stringify(sheetData));
      if (filename) localStorage.setItem(filenameKey, filename);
    };

    const timeout = setTimeout(save, 200);
    return () => clearTimeout(timeout);
  }, [sheetData, filename, key, filenameKey]);
}

export default useLocalSheet;
