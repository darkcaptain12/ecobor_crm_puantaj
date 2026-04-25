'use client';

import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

type Props = {
  data: Record<string, any>[];
  filename: string;
  label?: string;
};

export default function ExportButton({ data, filename, label = 'Excel İndir' }: Props) {
  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Veri');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <button
      onClick={handleExport}
      disabled={!data.length}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {label} ({data.length})
    </button>
  );
}
