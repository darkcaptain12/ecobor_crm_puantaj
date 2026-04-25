'use client';

import { useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type InventoryItem = {
  id: string;
  quantity: number;
  min_stock: number;
  product: { name: string; unit: string };
};

type EngineerItem = {
  engineer_id: string;
  product_id: string;
  quantity: number;
  product: { name: string; unit: string };
  engineer: { name: string };
};

type Props = {
  inventory: InventoryItem[];
  engineerStock: EngineerItem[];
  engineers: { id: string; name: string }[];
  products: { id: string; name: string; unit: string }[];
};

type Modal =
  | { type: 'add'; item: InventoryItem }
  | { type: 'set'; item: InventoryItem }
  | { type: 'engineer'; engineerId: string; productId: string; engineerName: string; productName: string; unit: string; current: number }
  | null;

export default function InventoryActions({ inventory, engineerStock, engineers, products }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [amount, setAmount] = useState('');
  const [minStock, setMinStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [engId, setEngId] = useState('');
  const [prodId, setProdId] = useState('');
  const [engQty, setEngQty] = useState('');
  const [addMode, setAddMode] = useState(true);
  const [showNewEng, setShowNewEng] = useState(false);

  async function submitInventory() {
    if (!modal || modal.type === 'engineer') return;
    setLoading(true);
    const isAdd = modal.type === 'add';
    await fetch('/api/admin/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: modal.item.id,
        quantity: Number(amount),
        min_stock: minStock ? Number(minStock) : undefined,
        add: isAdd,
      }),
    });
    setLoading(false);
    setModal(null);
    setAmount('');
    setMinStock('');
    router.refresh();
  }

  async function submitEngineer() {
    if (!modal || modal.type !== 'engineer') return;
    setLoading(true);
    await fetch('/api/admin/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engineer_id: modal.engineerId,
        product_id: modal.productId,
        quantity: Number(amount),
        add: addMode,
      }),
    });
    setLoading(false);
    setModal(null);
    setAmount('');
    router.refresh();
  }

  async function submitNewEngStock() {
    if (!engId || !prodId || !engQty) return;
    setLoading(true);
    await fetch('/api/admin/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engineer_id: engId,
        product_id: prodId,
        quantity: Number(engQty),
        add: true,
      }),
    });
    setLoading(false);
    setShowNewEng(false);
    setEngId(''); setProdId(''); setEngQty('');
    router.refresh();
  }

  const selectedProduct = products.find((p) => p.id === prodId);

  return (
    <>
      {/* Ana Depo Tablosu */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="flex items-center justify-between p-5 border-b border-eco-border">
          <h2 className="font-semibold text-eco-text">Ana Depo Stoku</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Ürün', 'Miktar', 'Min. Stok', 'Durum', 'İşlem'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {inventory.map((item) => {
                const low = item.quantity <= item.min_stock;
                return (
                  <tr key={item.id} className={`hover:bg-eco-bg/50 ${low ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3 font-medium text-eco-text">{item.product?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${low ? 'text-eco-error' : 'text-eco-text'}`}>
                        {item.quantity} {item.product?.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-eco-text-2">{item.min_stock} {item.product?.unit}</td>
                    <td className="px-4 py-3">
                      {low ? (
                        <span className="text-eco-error text-xs font-medium">⚠ Düşük Stok</span>
                      ) : (
                        <span className="text-eco-green text-xs font-medium">✓ Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setModal({ type: 'add', item }); setAmount(''); setMinStock(''); }}
                          className="flex items-center gap-1 text-xs bg-eco-green/10 text-eco-green px-2.5 py-1.5 rounded-lg hover:bg-eco-green/20 font-medium transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Ekle
                        </button>
                        <button
                          onClick={() => { setModal({ type: 'set', item }); setAmount(String(item.quantity)); setMinStock(String(item.min_stock)); }}
                          className="flex items-center gap-1 text-xs bg-eco-bg text-eco-text-2 px-2.5 py-1.5 rounded-lg hover:bg-eco-border font-medium transition-colors">
                          <Pencil className="w-3.5 h-3.5" /> Düzenle
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mühendis Stok Tablosu */}
      <div className="bg-white rounded-xl shadow-card border border-eco-border">
        <div className="flex items-center justify-between p-5 border-b border-eco-border">
          <h2 className="font-semibold text-eco-text">Mühendis Araç Stokları</h2>
          <button
            onClick={() => setShowNewEng(true)}
            className="flex items-center gap-1 text-xs bg-eco-green text-white px-3 py-1.5 rounded-lg hover:bg-eco-green/90 font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" /> Stok Ata
          </button>
        </div>
        {showNewEng && (
          <div className="p-5 border-b border-eco-border bg-eco-bg/50">
            <p className="text-sm font-semibold text-eco-text mb-3">Mühendise Stok Ata</p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select value={engId} onChange={(e) => setEngId(e.target.value)}
                className="eco-input text-sm">
                <option value="">Mühendis seç</option>
                {engineers.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <select value={prodId} onChange={(e) => setProdId(e.target.value)}
                className="eco-input text-sm">
                <option value="">Ürün seç</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="relative">
                <input
                  type="number"
                  value={engQty}
                  onChange={(e) => setEngQty(e.target.value)}
                  placeholder={`Miktar ${selectedProduct ? `(${selectedProduct.unit})` : ''}`}
                  className="eco-input text-sm w-full"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitNewEngStock}
                  disabled={loading || !engId || !prodId || !engQty}
                  className="flex-1 bg-eco-green text-white text-sm font-medium rounded-lg py-2 hover:bg-eco-green/90 disabled:opacity-50 transition-colors">
                  {loading ? '...' : 'Ata'}
                </button>
                <button onClick={() => setShowNewEng(false)}
                  className="px-3 bg-eco-bg text-eco-text-2 rounded-lg hover:bg-eco-border transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-eco-bg border-b border-eco-border">
              <tr>
                {['Mühendis', 'Ürün', 'Miktar', 'İşlem'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-eco-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border">
              {engineerStock.map((item, i) => (
                <tr key={i} className="hover:bg-eco-bg/50">
                  <td className="px-4 py-3 font-medium text-eco-text">{item.engineer?.name}</td>
                  <td className="px-4 py-3 text-eco-text-2">{item.product?.name}</td>
                  <td className="px-4 py-3 font-semibold text-eco-text">{item.quantity} {item.product?.unit}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setModal({
                          type: 'engineer',
                          engineerId: item.engineer_id,
                          productId: item.product_id,
                          engineerName: item.engineer?.name,
                          productName: item.product?.name,
                          unit: item.product?.unit,
                          current: item.quantity,
                        });
                        setAmount('');
                        setAddMode(true);
                      }}
                      className="flex items-center gap-1 text-xs bg-eco-green/10 text-eco-green px-2.5 py-1.5 rounded-lg hover:bg-eco-green/20 font-medium transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Güncelle
                    </button>
                  </td>
                </tr>
              ))}
              {!engineerStock.length && (
                <tr><td colSpan={4} className="text-center py-8 text-eco-gray">Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-eco-text">
                {modal.type === 'add' && `Stok Ekle — ${modal.item.product?.name}`}
                {modal.type === 'set' && `Stok Düzenle — ${modal.item.product?.name}`}
                {modal.type === 'engineer' && `${modal.engineerName} — ${modal.productName}`}
              </h3>
              <button onClick={() => setModal(null)} className="text-eco-gray hover:text-eco-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modal.type === 'engineer' && (
              <div className="mb-4 p-3 bg-eco-bg rounded-lg text-sm text-eco-gray">
                Mevcut: <span className="font-semibold text-eco-text">{modal.current} {modal.unit}</span>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setAddMode(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${addMode ? 'bg-eco-green text-white' : 'bg-eco-bg text-eco-text-2 border border-eco-border'}`}>
                    Üstüne Ekle
                  </button>
                  <button
                    onClick={() => setAddMode(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${!addMode ? 'bg-eco-green text-white' : 'bg-eco-bg text-eco-text-2 border border-eco-border'}`}>
                    Direkt Yaz
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'add' && (
              <div className="mb-3 p-3 bg-eco-bg rounded-lg text-sm text-eco-gray">
                Mevcut: <span className="font-semibold text-eco-text">{modal.item.quantity} {modal.item.product?.unit}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-eco-text mb-1">
                  {modal.type === 'add' ? 'Eklenecek Miktar' : 'Miktar'}
                  {modal.type !== 'engineer' && ` (${modal.item.product?.unit})`}
                  {modal.type === 'engineer' && ` (${modal.unit})`}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="eco-input w-full"
                  autoFocus
                />
              </div>
              {modal.type === 'set' && (
                <div>
                  <label className="block text-sm font-medium text-eco-text mb-1">
                    Min. Stok ({modal.item.product?.unit})
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder={String(modal.item.min_stock)}
                    className="eco-input w-full"
                  />
                </div>
              )}
            </div>

            {modal.type === 'add' && amount && (
              <p className="mt-2 text-xs text-eco-gray">
                Yeni miktar: <span className="font-semibold text-eco-green">{modal.item.quantity + Number(amount)} {modal.item.product?.unit}</span>
              </p>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 bg-eco-bg text-eco-text-2 rounded-xl font-medium hover:bg-eco-border transition-colors text-sm">
                İptal
              </button>
              <button
                onClick={modal.type === 'engineer' ? submitEngineer : submitInventory}
                disabled={loading || !amount}
                className="flex-1 py-2.5 bg-eco-green text-white rounded-xl font-semibold hover:bg-eco-green/90 disabled:opacity-50 transition-colors text-sm">
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
