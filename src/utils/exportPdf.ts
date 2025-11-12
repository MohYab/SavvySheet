// Robust dynamisk PDF-export
export interface ExportPdfOptions<T extends Record<string, unknown>> {
  data: T[];
  columns?: string[]; // Om du vill styra ordning
  filename: string;
  title?: string;
}

export async function exportToPdf<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  title = 'SavvySheet',
}: ExportPdfOptions<T>) {
  const [{ default: jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const autoTable =
    (autoTableMod as unknown as { default?: (doc: unknown, o: unknown) => void }).default ??
    (autoTableMod as unknown as (doc: unknown, o: unknown) => void);

  const doc = new jsPDF({
    orientation: (columns ?? Object.keys(data[0] ?? {})).length > 8 ? 'landscape' : 'portrait',
  });

  doc.setFontSize(14);
  doc.text(title, 14, 16);

  if (data.length === 0) {
    doc.text('Ingen data', 14, 28);
    doc.save(filename);
    return;
  }

  const headerCols = columns ?? Object.keys(data[0]);
  const head = [headerCols];
  const body = data.map((row) =>
    headerCols.map((k) => {
      const v = row[k];
      if (v == null) return '';
      if (v instanceof Date) return v.toISOString();
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      return String(v);
    }),
  );

  autoTable(doc as unknown as object, {
    head,
    body,
    startY: 22,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [20, 24, 40], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
