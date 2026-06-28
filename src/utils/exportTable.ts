export type TableExportColumn = {
  id: string;
  label: string;
  getValue: (row: unknown, rowIndex: number) => string;
};

export type TableExportData = {
  filename: string;
  title?: string;
  columns: TableExportColumn[];
  rows: unknown[];
  showSerialNumber?: boolean;
  serialNumberLabel?: string;
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'export';
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildExportRows(data: TableExportData): string[][] {
  const headers: string[] = [];

  if (data.showSerialNumber) {
    headers.push(data.serialNumberLabel ?? 'S.No');
  }

  headers.push(...data.columns.map((column) => column.label));

  const body = data.rows.map((row, index) => {
    const values: string[] = [];

    if (data.showSerialNumber) {
      values.push(String(index + 1));
    }

    values.push(...data.columns.map((column) => column.getValue(row, index)));

    return values;
  });

  return [headers, ...body];
}

export function exportTableToCsv(data: TableExportData): void {
  const rows = buildExportRows(data);
  const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(data.filename)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportTableToPdf(data: TableExportData): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const rows = buildExportRows(data);
  const [head, ...body] = rows;

  if (data.title) {
    doc.setFontSize(14);
    doc.text(data.title, 40, 32);
  }

  autoTable(doc, {
    head: [head],
    body,
    startY: data.title ? 48 : 32,
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [107, 29, 58],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [247, 245, 242],
    },
    margin: { left: 32, right: 32 },
  });

  doc.save(`${sanitizeFilename(data.filename)}.pdf`);
}
