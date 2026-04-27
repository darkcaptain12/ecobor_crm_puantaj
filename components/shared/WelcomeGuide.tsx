'use client';

import { useState, useEffect } from 'react';
import {
  X, BookOpen, Users, ShoppingBag, Truck, Gift, Upload, LayoutDashboard,
  Calendar, Package, CheckSquare, Award, MessageCircle, ChevronRight, ChevronLeft,
  Phone, MapPin, Wheat, Plus, Search, Shield, BarChart2, Settings, Leaf,
  AlertTriangle, Star, Zap, ArrowRight
} from 'lucide-react';

const STORAGE_KEY = 'ecobor_guide_dismissed';

// ─── Mühendis Rehber Adımları ──────────────────────────────────────────────
const ENGINEER_STEPS = [
  {
    icon: LayoutDashboard,
    color: 'bg-eco-green',
    title: 'Dashboard',
    subtitle: 'Günlük özetiniz burada',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-eco-green text-white rounded-lg p-3 flex items-center justify-between">
          <span className="font-semibold">Toplam Müşteri</span>
          <span className="text-2xl font-bold">47</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
            <p className="font-semibold text-yellow-800">3</p>
            <p className="text-yellow-600 text-[10px]">Kritik Dönem</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
            <CheckSquare className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="font-semibold text-blue-800">5</p>
            <p className="text-blue-600 text-[10px]">Bekleyen Görev</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-red-700 text-[10px] font-semibold">⚠️ Ayşe Hanım&apos;ın zeytini kritik dönemde — aranmalı</p>
        </div>
      </div>
    ),
    desc: 'Giriş yaptığınızda ilk gördüğünüz ekran. Müşteri sayısı, kritik dönem alarmları, bekleyen görevler ve son bildirimler burada görünür.',
    tips: ['Kırmızı alarmlar acil müşterileri gösterir', 'Görevleri buradan hızlıca takip edebilirsiniz'],
  },
  {
    icon: Users,
    color: 'bg-blue-600',
    title: 'Müşterilerim',
    subtitle: 'Tüm müşteri yönetimi',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="flex gap-1 flex-wrap">
          {['Tümü', 'Yeni', 'Eski', 'Önemli', 'Potansiyel'].map((t, i) => (
            <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${i === 0 ? 'bg-eco-green text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{t}</span>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold">Mehmet Yılmaz</p>
            <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full">Yeni</span>
          </div>
          <p className="text-gray-500 text-[10px] flex items-center gap-1"><Phone className="w-2.5 h-2.5" />0541 113 4035</p>
          <p className="text-gray-500 text-[10px] flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5" />İzmir</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="bg-green-50 text-green-700 text-[10px] px-1.5 rounded-full">Zeytin</span>
            <span className="bg-green-50 text-green-700 text-[10px] px-1.5 rounded-full">Domates</span>
          </div>
        </div>
      </div>
    ),
    desc: 'Müşterilerinizi durum bazında filtreleyin. Yeşil avatar = hediye hakkı kazanmış müşteri. Kilitli kartlar = başka mühendise ait (sadece görüntüleme).',
    tips: ['Yeni / Eski / Önemli / Potansiyel filtresi kullanın', '"Ortak Havuz" ile tüm müşterileri görebilirsiniz', 'Bitki türüne veya şehre göre de arama yapabilirsiniz'],
  },
  {
    icon: Plus,
    color: 'bg-purple-600',
    title: 'Yeni Müşteri Ekle',
    subtitle: 'Hızlı & eksiksiz kayıt',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-gray-200 rounded p-1.5">
            <p className="text-[10px] text-gray-500">Ad Soyad *</p>
            <p className="font-medium">Fatma Kaya</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-1.5">
            <p className="text-[10px] text-gray-500">Telefon *</p>
            <p className="font-medium">0532 284 7561</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-red-300 rounded p-1.5">
            <p className="text-[10px] text-red-500">Müşteri Durumu *</p>
            <p className="font-medium text-blue-700">Yeni Müşteri</p>
          </div>
          <div className="bg-white border border-red-300 rounded p-1.5">
            <p className="text-[10px] text-red-500">Kaynak *</p>
            <p className="font-medium text-green-700">Tavsiye</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-1.5">
          <p className="text-[10px] text-gray-500">Bitki Türleri</p>
          <div className="flex gap-1 mt-0.5 flex-wrap">
            <span className="bg-green-50 text-green-700 text-[10px] px-1.5 rounded-full flex items-center gap-0.5">Üzüm <X className="w-2 h-2" /></span>
            <span className="bg-green-50 text-green-700 text-[10px] px-1.5 rounded-full flex items-center gap-0.5">Zeytin <X className="w-2 h-2" /></span>
          </div>
        </div>
        <div className="bg-eco-green/10 border border-eco-green/20 rounded p-1.5 flex items-center gap-1">
          <ShoppingBag className="w-3 h-3 text-eco-green" />
          <p className="text-[10px] text-eco-green font-medium">✓ Satış de ekle (opsiyonel)</p>
        </div>
      </div>
    ),
    desc: 'Durum ve kaynak seçimi ZORUNLUDUR. Birden fazla bitki türü ekleyebilirsiniz. İsterseniz müşteriyi eklerken aynı anda satış da girebilirsiniz — iki kez giriş yapmanıza gerek yok.',
    tips: ['Durum: Yeni / Eski / Önemli / Potansiyel', 'Kaynak: Reklam / Tavsiye / Doğrudan-Saha', 'Birden fazla bitki = Enter ile ekle', '"Satış de ekle" kutusunu işaretleyin'],
  },
  {
    icon: MessageCircle,
    color: 'bg-green-600',
    title: 'Müşteri Detay & WhatsApp',
    subtitle: 'Tek tıkla iletişim',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold">Mehmet Yılmaz</p>
              <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 rounded-full">Yeni</span>
            </div>
            <a className="bg-[#25D366] text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-0.5">
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </a>
          </div>
          <div className="space-y-1 text-[10px] text-gray-500">
            <p className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" />0541 113 4035</p>
            <p className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />İzmir</p>
            <p className="flex items-center gap-1"><Wheat className="w-2.5 h-2.5" />Zeytin, Domates</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-eco-green text-white text-[10px] text-center py-1.5 rounded font-medium">Etkileşim</div>
          <div className="bg-gray-100 text-gray-700 text-[10px] text-center py-1.5 rounded font-medium">Reçete</div>
          <div className="bg-purple-50 text-purple-700 text-[10px] text-center py-1.5 rounded font-medium">Satış Yap</div>
        </div>
      </div>
    ),
    desc: 'Müşteri adına tıklayarak detay sayfasına girin. Yeşil WhatsApp butonu ile doğrudan o müşterinin sohbetini açın (hazır mesaj yok). Etkileşim, reçete ve satış bu ekrandan eklenir.',
    tips: ['WhatsApp butonuna basınca direkt o numara açılır', 'Etkileşim = arama, ziyaret, not', 'Kargo geçmişi de bu sayfada görünür'],
  },
  {
    icon: ShoppingBag,
    color: 'bg-orange-600',
    title: 'Saha Satışı',
    subtitle: 'Sipariş oluşturma',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded p-2">
          <p className="text-[10px] text-gray-500 mb-1">Müşteri seç</p>
          <p className="font-medium text-blue-700">Mehmet Yılmaz — İzmir</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-medium">Ecobor Bor Gübre</p>
            <span className="text-eco-green font-bold">2 Lt</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-medium">Zeytinlere Özel Sprey</p>
            <span className="text-eco-green font-bold">1 Lt</span>
          </div>
        </div>
        <div className="bg-eco-green text-white rounded p-1.5 flex justify-between">
          <span>Toplam:</span>
          <span className="font-bold">₺280 · 45 puan</span>
        </div>
      </div>
    ),
    desc: 'Müşteri seçin, ürünleri ekleyin ve siparişi kaydedin. Sipariş oluştuğunda müşterinin puanı otomatik güncellenir. Saha satışı stoktan düşer, normal satış merkezi depodan.',
    tips: ['Saha satışı kendi stoğunuzdan düşer', 'Müşteri puanı otomatik eklenir', 'Siparişi kaydettiğinizde kargo eklenebilir'],
  },
  {
    icon: Truck,
    color: 'bg-blue-800',
    title: 'Kargo Takibi',
    subtitle: 'Gönderi yönetimi',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-[11px]">Sipariş #ECO2025001</p>
            <span className="text-purple-600 text-[10px] font-semibold">Yolda</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            {['Hazır', 'Kargoda', 'Yolda', 'Teslim'].map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${i <= 2 ? 'bg-eco-green' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-gray-500 text-[10px]">Yurtiçi · TR123456789</p>
        </div>
      </div>
    ),
    desc: 'Siparişlere kargo bilgisi ekleyin ve durumunu güncelleyin. "Demo Simüle Et" butonu ile kargo adımlarını test edebilirsiniz.',
    tips: ['Kargo numarası + kargo şirketi girin', 'Durum: Hazırlanıyor → Kargoda → Yolda → Teslim', 'Müşteri kendi panelinden kargosunu takip eder'],
  },
  {
    icon: Gift,
    color: 'bg-yellow-600',
    title: 'Hediye Yönetimi',
    subtitle: 'Puan karşılığı ödül',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-eco-green text-white text-[10px] flex items-center justify-center font-bold">M</div>
              <p className="font-medium">Mehmet Yılmaz</p>
            </div>
            <p className="text-eco-green font-bold text-[11px]">850 puan</p>
          </div>
          <p className="text-[10px] text-eco-green">2 hediye hakkı var</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Gift className="w-3 h-3 text-eco-green" />
            <div>
              <p className="font-medium text-[11px]">Küçük Hediye Paketi</p>
              <p className="text-[10px] text-gray-500">500 puan karşılığı</p>
            </div>
          </div>
          <span className="bg-eco-green text-white text-[10px] px-2 py-0.5 rounded-lg">Hediye Verildi</span>
        </div>
      </div>
    ),
    desc: 'Puan eşiğini geçen müşterilere hediye verilebilir. Müşteri adına tıklayarak açın, uygun ödülleri görün ve "Hediye Verildi" butonuna basın — puan otomatik düşülür.',
    tips: ['Yeşil avatar = hediye hakkı kazanmış', 'Puan eşiği admin tarafından belirlenir', '"Hediye Verildi" sonrası puan anında güncellenir'],
  },
  {
    icon: Upload,
    color: 'bg-gray-700',
    title: 'Veri Aktar',
    subtitle: 'Excel toplu import',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="border-2 border-dashed border-eco-green/40 rounded-xl p-4 text-center bg-eco-green/5">
          <Upload className="w-6 h-6 text-eco-green mx-auto mb-1" />
          <p className="text-eco-green font-medium text-[11px]">Excel dosyasını seçin</p>
          <p className="text-gray-400 text-[10px]">.xlsx formatı</p>
        </div>
        <div className="bg-eco-green/10 border border-eco-green/20 rounded-lg p-2">
          <p className="text-eco-green font-semibold text-[11px] flex items-center gap-1">✓ Import Tamamlandı</p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            <div className="bg-white rounded text-center py-1"><p className="font-bold text-eco-green">5.941</p><p className="text-[9px] text-gray-500">Eklendi</p></div>
            <div className="bg-white rounded text-center py-1"><p className="font-bold text-gray-400">12</p><p className="text-[9px] text-gray-500">Atlandı</p></div>
            <div className="bg-white rounded text-center py-1"><p className="font-bold">5.953</p><p className="text-[9px] text-gray-500">Toplam</p></div>
          </div>
        </div>
      </div>
    ),
    desc: 'Elinizdeki Excel listesini sisteme yükleyin. Aynı telefon numarası varsa otomatik atlanır. Sütun sırası: Tarih → Ad → Şehir → Telefon → Eski/Yeni → Satış Tutarı → Satış Durumu → Kaynak → Görüşme → Not → Bitki.',
    tips: ['Veriler size atanır ve havuzda da görünür', 'Yükleme geçmişi korunur, üzerine yazılmaz', 'Tarihler Excel tarihinden alınır'],
  },
];

// ─── Admin Rehber Adımları ─────────────────────────────────────────────────
const ADMIN_STEPS = [
  {
    icon: LayoutDashboard,
    color: 'bg-eco-green',
    title: 'Admin Dashboard',
    subtitle: 'Tam sistem görünümü',
    visual: (
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: 'Toplam Müşteri', value: '47', color: 'text-eco-green' },
          { label: 'Toplam Sipariş', value: '23', color: 'text-blue-600' },
          { label: 'Aylık Ciro', value: '₺48.200', color: 'text-purple-600' },
          { label: 'Aktif Kullanıcı', value: '4', color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-2 text-center">
            <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>
    ),
    desc: 'Tüm sistem istatistiklerini görürsünüz. Müşteri sayısı, siparişler, ciro ve kullanıcı bilgileri.',
    tips: ['Günlük ve aylık özet burada', 'Tüm mühendislerin verileri görünür'],
  },
  {
    icon: Users,
    color: 'bg-blue-600',
    title: 'Kullanıcı Yönetimi',
    subtitle: 'Personel ekleme/düzenleme',
    visual: (
      <div className="space-y-1.5 text-xs">
        {[
          { name: 'Buse Yılmaz', role: 'Mühendis', color: 'bg-green-50 text-green-700' },
          { name: 'Admin', role: 'Admin', color: 'bg-purple-50 text-purple-700' },
          { name: 'Müdür Mehmet', role: 'Müdür', color: 'bg-blue-50 text-blue-700' },
        ].map(u => (
          <div key={u.name} className="bg-white border border-gray-200 rounded p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-eco-green text-white text-[10px] flex items-center justify-center">{u.name[0]}</div>
              <p className="font-medium text-[11px]">{u.name}</p>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${u.color}`}>{u.role}</span>
          </div>
        ))}
      </div>
    ),
    desc: 'Mühendis, müdür ve saha temsilcisi ekleyin. Telefon ile şifre belirlenir. Uzak erişim iznini buradan yönetebilirsiniz.',
    tips: ['Şifre eklerken güçlü bir şifre kullanın', 'Rol: Mühendis / Müdür / Saha Temsilcisi', '"Uzak Erişim" ile dışarıdan bağlanmayı açın'],
  },
  {
    icon: BarChart2,
    color: 'bg-purple-600',
    title: 'Raporlar',
    subtitle: 'Satış ve performans analizi',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="font-semibold mb-1.5">Mühendis Performansı</p>
          {[
            { name: 'Buse Y.', val: 85, amount: '₺23.400' },
            { name: 'Ali D.', val: 60, amount: '₺16.200' },
          ].map(r => (
            <div key={r.name} className="mb-1.5">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span>{r.name}</span><span className="text-eco-green font-medium">{r.amount}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 bg-eco-green rounded-full" style={{ width: `${r.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    desc: 'Mühendis başına satış, müşteri dağılımı, aylık ciro raporları. Excel indirme butonu ile dışa aktarın.',
    tips: ['"Excel İndir" ile tüm veriyi dışa aktar', 'Filtreden tarih aralığı seçin', 'Her mühendis kendi ciro grafiğini görür'],
  },
  {
    icon: Package,
    color: 'bg-orange-600',
    title: 'Ürün & Stok Yönetimi',
    subtitle: 'Envanter takibi',
    visual: (
      <div className="space-y-1.5 text-xs">
        <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center justify-between">
          <div>
            <p className="font-semibold text-red-800">Ecobor Bor Gübre</p>
            <p className="text-red-600 text-[10px]">⚠️ Düşük stok: 3 Lt kaldı</p>
          </div>
          <span className="text-red-600 font-bold">3 Lt</span>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 flex items-center justify-between">
          <div>
            <p className="font-semibold">Zeytinlere Özel Sprey</p>
            <p className="text-gray-500 text-[10px]">Yeterli stok</p>
          </div>
          <span className="text-eco-green font-bold">48 Lt</span>
        </div>
      </div>
    ),
    desc: 'Ürün ekleyin, fiyat ve puan değeri belirleyin. Stok miktarını güncelleyin. Mühendislere araç stoğu atayın.',
    tips: ['Kırmızı = düşük stok uyarısı', 'Her ürüne puan değeri atayabilirsiniz', 'Mühendise stok atama: Envanter > Ata'],
  },
  {
    icon: Award,
    color: 'bg-yellow-600',
    title: 'Ödül Kuralları',
    subtitle: 'Puan sistemi yönetimi',
    visual: (
      <div className="space-y-1.5 text-xs">
        {[
          { name: 'Küçük Hediye', points: 500, color: 'text-yellow-600' },
          { name: 'Orta Hediye', points: 1000, color: 'text-gray-500' },
          { name: 'Büyük Hediye', points: 2000, color: 'text-yellow-500' },
        ].map(r => (
          <div key={r.name} className="bg-white border border-gray-200 rounded p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className={`w-4 h-4 ${r.color}`} />
              <p className="font-medium">{r.name}</p>
            </div>
            <span className="text-eco-green font-bold">{r.points} puan</span>
          </div>
        ))}
      </div>
    ),
    desc: 'Kaç puana hangi hediyenin verileceğini siz belirlersiniz. Müşteriler puanlarını çiftçi panelinden görür, hediye talep eder.',
    tips: ['Ödül ekle/çıkar/düzenle', 'Pasif yapılan ödüller müşteride görünmez', 'Mühendis hediyeyi bu listeden seçerek işaretler'],
  },
  {
    icon: Shield,
    color: 'bg-gray-800',
    title: 'Uzak Erişim Yönetimi',
    subtitle: 'Dışarıdan erişim kontrolü',
    visual: (
      <div className="space-y-1.5 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-eco-green/10 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-eco-green" />
              </div>
              <div>
                <p className="font-medium text-[11px]">Buse Yılmaz</p>
                <p className="text-[10px] text-eco-green">Mühendis · 7 Gün Erişim Açık</p>
              </div>
            </div>
            <div className="w-9 h-5 bg-eco-green rounded-full flex items-center justify-end pr-0.5">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5">
          🔐 Uzak erişim açıldığında 7 gün otomatik süre atanır
        </p>
      </div>
    ),
    desc: 'Personelin şirket dışından sisteme bağlanabilmesi için bu ekrandan izin verin. 7 günlük otomatik süre atanır, süre dolunca kapanır.',
    tips: ['Toggle açık = dışarıdan bağlanabilir', '7 gün sonra otomatik kapanır', 'Acil durumlarda kapatabilirsiniz'],
  },
];

type Step = typeof ENGINEER_STEPS[number];

interface GuideModalProps {
  steps: Step[];
  onClose: () => void;
}

function GuideModal({ steps, onClose }: GuideModalProps) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`${step.color} p-5 text-white flex-shrink-0`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Kullanım Kılavuzu</span>
            </div>
            <button onClick={onClose} className="opacity-70 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{step.title}</h2>
              <p className="text-sm opacity-80">{step.subtitle}</p>
            </div>
          </div>
          {/* Step dots */}
          <div className="flex gap-1.5 mt-4">
            {steps.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/40 w-1.5'}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Visual mockup */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            {step.visual}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">{step.desc}</p>

          {/* Tips */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Zap className="w-3 h-3" /> Hızlı İpuçları
            </p>
            {step.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 rounded-full bg-eco-green/10 text-eco-green flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Footer navigation */}
        <div className="border-t border-gray-100 p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Önceki
          </button>
          <span className="text-xs text-gray-400">{current + 1} / {steps.length}</span>
          {current < steps.length - 1 ? (
            <button
              onClick={() => setCurrent(current + 1)}
              className="flex items-center gap-1 text-sm text-eco-green font-medium hover:text-eco-green-dk"
            >
              Sonraki <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onClose}
              className="flex items-center gap-1 text-sm bg-eco-green text-white px-3 py-1.5 rounded-lg">
              Tamam <CheckSquare className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface WelcomeGuideProps {
  role: 'ENGINEER' | 'ADMIN' | 'MANAGER';
  userName?: string;
}

export default function WelcomeGuide({ role, userName }: WelcomeGuideProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const steps = role === 'ADMIN' ? ADMIN_STEPS : ENGINEER_STEPS;

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setShowPopup(true);
  }, []);

  function dismiss(permanent: boolean) {
    setShowPopup(false);
    if (permanent) localStorage.setItem(STORAGE_KEY, '1');
  }

  function openGuide() {
    setShowPopup(false);
    setShowGuide(true);
  }

  return (
    <>
      {/* Welcome Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-eco-green p-6 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold">Hoş Geldiniz! 👋</h2>
              <p className="text-white/80 text-sm mt-1">
                {userName ? `Merhaba ${userName},` : ''} Ecobor CRM sistemine hoş geldiniz
              </p>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {(role === 'ADMIN' ? [
                  { icon: Users, label: 'Kullanıcı Yönetimi' },
                  { icon: BarChart2, label: 'Raporlar' },
                  { icon: Package, label: 'Stok & Ürünler' },
                  { icon: Shield, label: 'Erişim Kontrolü' },
                ] : [
                  { icon: Users, label: 'Müşteri Yönetimi' },
                  { icon: ShoppingBag, label: 'Satış & Siparişler' },
                  { icon: Truck, label: 'Kargo Takibi' },
                  { icon: Gift, label: 'Hediye Yönetimi' },
                ]).map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-eco-bg rounded-lg p-2.5">
                    <Icon className="w-4 h-4 text-eco-green shrink-0" />
                    <span className="font-medium text-eco-text">{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-eco-gray text-center">
                Sistemi ilk kez mi kullanıyorsunuz? Kılavuzu açarak her özelliği adım adım öğrenin.
              </p>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={openGuide}
                  className="w-full bg-eco-green text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-eco-green-dk transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  Kullanım Kılavuzunu Aç
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => dismiss(false)}
                    className="py-2.5 rounded-xl border border-eco-border text-eco-gray text-sm hover:bg-eco-bg transition-colors"
                  >
                    Daha Sonra
                  </button>
                  <button
                    onClick={() => dismiss(true)}
                    className="py-2.5 rounded-xl border border-eco-border text-eco-gray text-sm hover:bg-eco-bg transition-colors"
                  >
                    Bir Daha Gösterme
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <GuideModal steps={steps} onClose={() => setShowGuide(false)} />
      )}

      {/* Floating help button (always visible) */}
      <button
        onClick={() => setShowGuide(true)}
        title="Kullanım Kılavuzu"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-eco-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-eco-green-dk transition-colors group"
      >
        <BookOpen className="w-5 h-5" />
        <span className="absolute right-14 bg-eco-text text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Kullanım Kılavuzu
        </span>
      </button>
    </>
  );
}
