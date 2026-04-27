'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, MapPin, Plus, X, ShoppingBag } from 'lucide-react';

const TURKISH_CITIES = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin',
  'Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa',
  'Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan',
  'Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Isparta',
  'İçel','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir',
  'Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla',
  'Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop',
  'Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van',
  'Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak',
  'Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce',
];

const CROP_SUGGESTIONS = [
  'Zeytin','Domates','Biber','Patlıcan','Salatalık','Kavun','Karpuz',
  'Üzüm','Çilek','Elma','Armut','Şeftali','Kiraz','Vişne','Nar',
  'Buğday','Mısır','Arpa','Çeltik','Ayçiçeği','Pamuk','Tütün',
  'Patates','Soğan','Sarımsak','Fasulye','Nohut','Mercimek',
  'Narenciye','Limon','Portakal','Mandalina','Bahçe Bitkileri',
];

export default function YeniMusteriler() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [addSale, setAddSale] = useState(false);
  const [cropInput, setCropInput] = useState('');
  const [cropTags, setCropTags] = useState<string[]>([]);
  const [showCropSuggestions, setShowCropSuggestions] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', region: '', planting_date: '',
    notes: '', location_lat: '', location_lng: '',
    status: 'yeni', source: '',
  });

  const [saleItems, setSaleItems] = useState([{ product_id: '', quantity: 1, unit_price: '' }]);

  useEffect(() => {
    if (addSale) fetch('/api/admin/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []));
  }, [addSale]);

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  function getLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      set('location_lat', String(pos.coords.latitude));
      set('location_lng', String(pos.coords.longitude));
    });
  }

  function addCropTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !cropTags.includes(trimmed)) setCropTags(p => [...p, trimmed]);
    setCropInput('');
    setShowCropSuggestions(false);
  }

  function removeCropTag(tag: string) {
    setCropTags(p => p.filter(t => t !== tag));
  }

  const filteredSuggestions = cropInput.length > 0
    ? CROP_SUGGESTIONS.filter(s => s.toLowerCase().includes(cropInput.toLowerCase()) && !cropTags.includes(s))
    : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.status) { setError('Müşteri durumu seçiniz'); return; }
    if (!form.source) { setError('Müşteri kaynağı seçiniz'); return; }
    setLoading(true);
    setError('');

    // 1. Müşteri oluştur
    const customerRes = await fetch('/api/engineer/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        crop_type: cropTags.join(', '),
      }),
    });
    const customerData = await customerRes.json();
    if (!customerRes.ok) { setError(customerData.error ?? 'Müşteri eklenemedi'); setLoading(false); return; }

    // 2. Satış varsa oluştur
    if (addSale) {
      const validItems = saleItems.filter(i => i.product_id && i.quantity > 0);
      if (validItems.length > 0) {
        await fetch('/api/engineer/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customerData.id,
            items: validItems.map(i => ({
              product_id: i.product_id,
              quantity: Number(i.quantity),
              unit_price: i.unit_price ? Number(i.unit_price) : undefined,
            })),
          }),
        });
      }
    }

    router.push('/dashboard/musteriler');
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/musteriler" className="text-eco-gray hover:text-eco-text"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-eco-text">Yeni Müşteri</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-eco-border p-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-eco-error rounded-lg p-3 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Temel bilgiler */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-eco-text mb-1">Ad Soyad <span className="text-red-500">*</span></label>
              <input className="eco-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-eco-text mb-1">Telefon <span className="text-red-500">*</span></label>
              <input className="eco-input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </div>
          </div>

          {/* Müşteri Durumu + Kaynak — ZORUNLU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1">
                Müşteri Durumu <span className="text-red-500">*</span>
              </label>
              <select className="eco-select" value={form.status} onChange={(e) => set('status', e.target.value)} required>
                <option value="yeni">Yeni Müşteri</option>
                <option value="eski">Eski Müşteri</option>
                <option value="onemli">Önemli</option>
                <option value="potansiyel">Potansiyel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1">
                Müşteri Kaynağı <span className="text-red-500">*</span>
              </label>
              <select className="eco-select" value={form.source} onChange={(e) => set('source', e.target.value)} required>
                <option value="">Seçiniz...</option>
                <option value="Reklam">Reklam (Sosyal Medya / Google)</option>
                <option value="Tavsiye">Tavsiye</option>
                <option value="Doğrudan/Saha">Doğrudan / Saha Çalışması</option>
              </select>
            </div>
          </div>

          {/* Şehir + Ekim tarihi */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1">Şehir / Bölge</label>
              <input
                className="eco-input"
                list="cities-list"
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
                placeholder="İl seçin veya yazın..."
              />
              <datalist id="cities-list">
                {TURKISH_CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1">Ekim Tarihi <span className="text-eco-gray text-xs">(opsiyonel)</span></label>
              <input type="date" className="eco-input" value={form.planting_date} onChange={(e) => set('planting_date', e.target.value)} />
            </div>
          </div>

          {/* Çoklu Bitki Türü */}
          <div>
            <label className="block text-sm font-medium text-eco-text mb-1">Bitki Türleri</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {cropTags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-eco-green/10 text-eco-green text-xs px-2 py-1 rounded-full">
                  {tag}
                  <button type="button" onClick={() => removeCropTag(tag)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                className="eco-input"
                placeholder="Bitki türü ekle (örn: Zeytin, Domates)"
                value={cropInput}
                onChange={(e) => { setCropInput(e.target.value); setShowCropSuggestions(true); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (cropInput.trim()) addCropTag(cropInput); } }}
                onBlur={() => setTimeout(() => setShowCropSuggestions(false), 150)}
              />
              {showCropSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-eco-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredSuggestions.map(s => (
                    <button key={s} type="button" onMouseDown={() => addCropTag(s)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-eco-bg">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-eco-gray mt-1">Enter ile ekle · Birden fazla bitki ekleyebilirsiniz</p>
          </div>

          {/* GPS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-eco-text">GPS Konumu</label>
              <button type="button" onClick={getLocation} className="text-xs text-eco-green flex items-center gap-1">
                <MapPin className="w-3 h-3" />Konumumu Al
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="eco-input" placeholder="Enlem" value={form.location_lat} onChange={(e) => set('location_lat', e.target.value)} />
              <input className="eco-input" placeholder="Boylam" value={form.location_lng} onChange={(e) => set('location_lng', e.target.value)} />
            </div>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-eco-text mb-1">Notlar</label>
            <textarea className="eco-input h-20 resize-none" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>

          {/* Satış Ekle Toggle */}
          <div className="border-t border-eco-border pt-4">
            <button
              type="button"
              onClick={() => setAddSale(!addSale)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${addSale ? 'text-eco-green' : 'text-eco-gray hover:text-eco-green'}`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${addSale ? 'bg-eco-green border-eco-green' : 'border-eco-gray'}`}>
                {addSale && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <ShoppingBag className="w-4 h-4" />
              Satış de ekle (opsiyonel)
            </button>
          </div>

          {/* Satış Formu */}
          {addSale && (
            <div className="bg-eco-bg/50 rounded-xl border border-eco-border p-4 space-y-3">
              <p className="text-sm font-semibold text-eco-text">Satış Detayları</p>
              {saleItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <select
                    className="eco-select flex-1"
                    value={item.product_id}
                    onChange={(e) => {
                      const updated = [...saleItems];
                      const product = products.find((p: any) => p.id === e.target.value);
                      updated[idx] = { ...updated[idx], product_id: e.target.value, unit_price: product?.price ?? '' };
                      setSaleItems(updated);
                    }}
                  >
                    <option value="">Ürün seçin...</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {p.unit}</option>)}
                  </select>
                  <input
                    type="number" min="0.1" step="0.1" placeholder="Adet"
                    className="eco-input w-20"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...saleItems];
                      updated[idx] = { ...updated[idx], quantity: Number(e.target.value) };
                      setSaleItems(updated);
                    }}
                  />
                  <input
                    type="number" min="0" step="0.01" placeholder="Fiyat"
                    className="eco-input w-24"
                    value={item.unit_price}
                    onChange={(e) => {
                      const updated = [...saleItems];
                      updated[idx] = { ...updated[idx], unit_price: e.target.value };
                      setSaleItems(updated);
                    }}
                  />
                  {saleItems.length > 1 && (
                    <button type="button" onClick={() => setSaleItems(p => p.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 mt-2">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSaleItems(p => [...p, { product_id: '', quantity: 1, unit_price: '' }])}
                className="text-xs text-eco-green flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Ürün Ekle
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="eco-btn-primary py-2.5 px-6 disabled:opacity-60">
              {loading ? 'Kaydediliyor...' : addSale ? 'Müşteri & Satış Kaydet' : 'Müşteri Kaydet'}
            </button>
            <Link href="/dashboard/musteriler" className="eco-btn-secondary py-2.5 px-6">İptal</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
