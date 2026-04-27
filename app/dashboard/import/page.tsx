'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, FileSpreadsheet, Info } from 'lucide-react';

export default function VeriAktarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/engineer/import', { method: 'POST', body: fd });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Import başarısız');
    } else {
      setResult(data);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/musteriler" className="text-eco-gray hover:text-eco-text"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-eco-text">Müşteri Verisi Aktar</h1>
      </div>

      {/* Şablon bilgisi */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-2">
        <p className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" />Excel Dosya Formatı</p>
        <p>Dosyanızın sütunları şu sırada olmalıdır:</p>
        <div className="grid grid-cols-2 gap-1 text-xs mt-2">
          {[
            ['A', 'Tarih'],
            ['B', 'Ad Soyad *'],
            ['C', 'Şehir'],
            ['D', 'Telefon *'],
            ['E', 'Eski/Yeni Müşteri'],
            ['F', 'Satış Miktarı (₺)'],
            ['G', 'Satış Durumu'],
            ['H', 'Kaynak (Reklam/Tavsiye...)'],
            ['I', 'Ne Görüşüldü'],
            ['J', 'Not'],
            ['K', 'Hangi Bitki/Dekar'],
          ].map(([col, name]) => (
            <div key={col} className="flex items-center gap-2">
              <span className="bg-blue-200 text-blue-800 font-mono px-1.5 py-0.5 rounded text-[10px] w-6 text-center">{col}</span>
              <span>{name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-1 text-blue-600">* Zorunlu sütunlar · Aynı telefon numarası varsa atlanır</p>
      </div>

      {/* Dosya seçici */}
      <div className="bg-white rounded-xl border border-eco-border p-6">
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            file ? 'border-eco-green bg-eco-green/5' : 'border-eco-border hover:border-eco-green hover:bg-eco-bg'
          }`}
        >
          {file ? (
            <div className="space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-eco-green mx-auto" />
              <p className="font-semibold text-eco-text">{file.name}</p>
              <p className="text-xs text-eco-gray">{(file.size / 1024).toFixed(0)} KB · Değiştirmek için tıklayın</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 text-eco-gray mx-auto" />
              <p className="font-medium text-eco-text">Excel dosyasını seçin</p>
              <p className="text-xs text-eco-gray">.xlsx formatı desteklenir</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mt-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {result && (
          <div className="mt-4 bg-eco-green/10 border border-eco-green/20 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-eco-green flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />Import Tamamlandı
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3">
                <p className="text-2xl font-bold text-eco-green">{result.inserted}</p>
                <p className="text-xs text-eco-gray">Eklendi</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-2xl font-bold text-eco-gray">{result.skipped}</p>
                <p className="text-xs text-eco-gray">Atlandı (mevcut)</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-2xl font-bold text-eco-text">{result.total}</p>
                <p className="text-xs text-eco-gray">Toplam</p>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <details className="text-xs text-red-600 mt-2">
                <summary className="cursor-pointer">{result.errors.length} hata</summary>
                <ul className="mt-1 space-y-0.5">
                  {result.errors.map((e: string, i: number) => <li key={i}>• {e}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="eco-btn-primary py-2.5 px-6 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Yükleniyor...
              </span>
            ) : (
              <span className="flex items-center gap-2"><Upload className="w-4 h-4" />Aktar</span>
            )}
          </button>
          {result && (
            <Link href="/dashboard/musteriler" className="eco-btn-primary py-2.5 px-6">
              Müşterileri Görüntüle →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
