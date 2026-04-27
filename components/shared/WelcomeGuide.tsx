'use client';

import { useState, useEffect } from 'react';
import {
  X, BookOpen, Users, ShoppingBag, Truck, Gift, Upload, LayoutDashboard,
  Calendar, Package, CheckSquare, Award, MessageCircle, ChevronRight, ChevronLeft,
  Phone, MapPin, Wheat, Plus, Search, Shield, BarChart2, Leaf,
  AlertTriangle, Star, Zap, ArrowRight,
} from 'lucide-react';

const STORAGE_KEY = 'ecobor_guide_dismissed';

// ─── Mühendis Rehber Adımları (10 adım) ───────────────────────────────────────
const ENGINEER_STEPS = [
  {
    icon: LayoutDashboard,
    color: 'bg-eco-green',
    title: 'Dashboard',
    subtitle: 'Sabah özeti — güne buradan başlayın',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-3 gap-1.5">
          <div className="bg-eco-green text-white rounded-lg p-2 text-center">
            <p className="text-2xl font-bold leading-none">47</p>
            <p className="text-[10px] mt-0.5 opacity-80">Müşteri</p>
          </div>
          <div className="bg-blue-500 text-white rounded-lg p-2 text-center">
            <p className="text-2xl font-bold leading-none">5</p>
            <p className="text-[10px] mt-0.5 opacity-80">Görev</p>
          </div>
          <div className="bg-purple-500 text-white rounded-lg p-2 text-center">
            <p className="text-2xl font-bold leading-none">3</p>
            <p className="text-[10px] mt-0.5 opacity-80">Bildirim</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-300 rounded-lg p-2 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-semibold text-[10px]">2 Kritik Dönem Alarmı</p>
            <p className="text-red-600 text-[10px]">Ayşe Hanım — zeytin ilaçlama dönemi</p>
            <p className="text-red-600 text-[10px]">Hasan Bey — gübre sipariş zamanı</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1.5 flex items-center gap-1.5">
          <Star className="w-3 h-3 text-yellow-500 shrink-0" />
          <p className="text-yellow-800 text-[10px] font-medium">Mehmet Yılmaz hediye hakkı kazandı</p>
        </div>
      </div>
    ),
    desc: 'Giriş yaptığınızda ilk karşılaştığınız ekran. Toplam müşteri sayısı, bugüne ait bekleyen görevler, okunmamış bildirimler ve kırmızı renkteki kritik dönem alarmları burada listelenir. Kırmızı kartlar — o gün mutlaka aranması gereken müşterileri gösterir.',
    tips: [
      'Kırmızı alarm kartına tıklayınca doğrudan o müşterinin detay sayfasına gidersiniz',
      'Sarı "hediye hakkı" bildirimleri hediye ekranına kısayol açar',
      'Dashboard her giriş yaptığınızda otomatik yenilenir — F5 gerekmez',
      'Görev sayısına tıklayarak takvim ekranına geçebilirsiniz',
    ],
  },
  {
    icon: Users,
    color: 'bg-blue-600',
    title: 'Müşterilerim',
    subtitle: 'Filtreli müşteri listesi',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="flex gap-1 flex-wrap">
          {['Tümü (47)', 'Yeni (12)', 'Eski (18)', 'Önemli (9)', 'Potansiyel (8)'].map((t, i) => (
            <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${i === 0 ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{t}</span>
          ))}
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Mehmet Yılmaz', city: 'İzmir', badge: 'Yeni', badgeColor: 'bg-blue-50 text-blue-700', plant: 'Zeytin', points: '850 puan', green: true },
            { name: 'Fatma Kaya', city: 'Manisa', badge: 'Önemli', badgeColor: 'bg-yellow-50 text-yellow-700', plant: 'Üzüm', points: '420 puan', green: false },
            { name: 'Ali Demir', city: 'Aydın', badge: 'Eski', badgeColor: 'bg-gray-50 text-gray-600', plant: 'İncir', points: '210 puan', green: false },
          ].map(c => (
            <div key={c.name} className="bg-white border border-gray-200 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full ${c.green ? 'bg-eco-green' : 'bg-gray-200'} text-white text-[10px] flex items-center justify-center font-bold`}>
                    {c.name[0]}
                  </div>
                  <p className="font-semibold text-[11px]">{c.name}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.badgeColor}`}>{c.badge}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{c.city}</span>
                <span className="flex items-center gap-0.5"><Wheat className="w-2.5 h-2.5" />{c.plant}</span>
                <span className="text-eco-green font-medium ml-auto">{c.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    desc: 'Tüm müşterileriniz burada listelenir. Üstteki sekme filtreleriyle Yeni / Eski / Önemli / Potansiyel görünümüne geçin. Yeşil avatar — o müşteri hediye eşiğini geçmiş demektir. Arama kutusuna şehir veya bitki adı yazarak da filtre uygulayabilirsiniz.',
    tips: [
      'Filtreye tıklamak hızlıdır — her gün "Önemli" filtresini ilk açın',
      'Yeşil avatarlı müşterileri önce arayın, hediye fırsatı kaçırmayın',
      'Müşteri kartındaki yeşil WhatsApp simgesine tıklayınca doğrudan sohbet açılır',
      'Kilitli kartlar başka bir mühendise ait — sadece okuma erişiminiz var',
      'Arama kutusuna "05XX" yazarak telefon numarasıyla da arama yapabilirsiniz',
    ],
  },
  {
    icon: Plus,
    color: 'bg-purple-600',
    title: 'Yeni Müşteri Ekle',
    subtitle: 'Eksiksiz kayıt — zorunlu alanlar',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-white border border-gray-200 rounded p-1.5">
            <p className="text-[10px] text-gray-400">Ad Soyad *</p>
            <p className="font-medium text-gray-800">Fatma Kaya</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-1.5">
            <p className="text-[10px] text-gray-400">Telefon *</p>
            <p className="font-medium text-gray-800">0532 284 7561</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-white border-2 border-red-300 rounded p-1.5">
            <p className="text-[10px] text-red-500 font-medium">Durum * (zorunlu)</p>
            <p className="font-medium text-blue-700">Yeni Müşteri</p>
          </div>
          <div className="bg-white border-2 border-red-300 rounded p-1.5">
            <p className="text-[10px] text-red-500 font-medium">Kaynak * (zorunlu)</p>
            <p className="font-medium text-green-700">Tavsiye</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-1.5">
          <p className="text-[10px] text-gray-400">Bitki Türleri (birden fazla Enter ile)</p>
          <div className="flex gap-1 mt-0.5 flex-wrap">
            <span className="bg-green-50 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">Üzüm <X className="w-2 h-2" /></span>
            <span className="bg-green-50 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">Zeytin <X className="w-2 h-2" /></span>
            <span className="bg-gray-50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-full border border-dashed border-gray-300">+ ekle</span>
          </div>
        </div>
        <div className="bg-eco-green/10 border border-eco-green/20 rounded p-1.5 flex items-center gap-1.5">
          <ShoppingBag className="w-3 h-3 text-eco-green shrink-0" />
          <p className="text-[10px] text-eco-green font-medium">Aynı anda satış da ekle (opsiyonel)</p>
        </div>
      </div>
    ),
    desc: 'Müşteri kaydında Durum (Yeni / Eski / Önemli / Potansiyel) ve Kaynak (Reklam / Tavsiye / Doğrudan-Saha) seçimi zorunludur — bunlar olmadan form kaydedilmez. Bitki türleri çoklu seçimdir; her birini yazıp Enter tuşuna basın. Form altındaki "Satış de ekle" kutucuğunu işaretlerseniz müşteri kaydı ve ilk satışı tek seferde girebilirsiniz.',
    tips: [
      'Telefon numarasını 05XX formatında girin — sistem 0\'ı otomatik tanır',
      'Birden fazla bitki eklemek için her birinden sonra Enter\'a basın',
      '"Satış de ekle" kutucuğu ile müşteri + satış tek formda kaydedilir, iki kez giriş gerekmez',
      'Durum seçmeden Kaydet\'e basarsanız sistem sizi uyarır — kırmızı kenarlıklı alan zorunludur',
      'Kaynak bilgisi raporlarda müşteri edinim kanalını göstermek için kullanılır',
    ],
  },
  {
    icon: MessageCircle,
    color: 'bg-green-600',
    title: 'Müşteri Detay & WhatsApp',
    subtitle: 'Tek sayfada tüm geçmiş',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-[13px]">Mehmet Yılmaz</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 rounded-full">Yeni</span>
                <span className="bg-green-50 text-green-700 text-[10px] px-1.5 rounded-full">850 puan</span>
              </div>
            </div>
            <div className="bg-[#25D366] text-white text-[10px] px-2 py-1.5 rounded-lg flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span className="font-semibold">WhatsApp</span>
            </div>
          </div>
          <div className="space-y-0.5 text-[10px] text-gray-500">
            <p className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" />0541 113 4035</p>
            <p className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />İzmir · Kemalpaşa</p>
            <p className="flex items-center gap-1"><Wheat className="w-2.5 h-2.5" />Zeytin, Domates</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: 'Etkileşim', bg: 'bg-eco-green text-white' },
            { label: 'Siparişler', bg: 'bg-gray-100 text-gray-700' },
            { label: 'Kargo', bg: 'bg-gray-100 text-gray-700' },
            { label: 'Satış Yap', bg: 'bg-purple-50 text-purple-700' },
          ].map(tab => (
            <div key={tab.label} className={`${tab.bg} text-[9px] text-center py-1.5 rounded font-medium`}>{tab.label}</div>
          ))}
        </div>
      </div>
    ),
    desc: 'Müşteri listesinde isme tıklayınca bu detay sayfasına girersiniz. Yeşil WhatsApp butonu o numarayı doğrudan açar — hazır mesaj yoktur, siz yazarsınız. Sayfanın alt sekmelerinde etkileşim geçmişi, siparişler, kargo takibi ve satış formu bulunur.',
    tips: [
      'WhatsApp butonuna bastığınızda telefon uygulaması açılır, mesaj kutusu boş gelir — siz yazarsınız',
      'Etkileşim sekmesine her aramadan sonra not düşün — tarih otomatik kaydedilir',
      'Kargo sekmesi sipariş oluşturduktan sonra görünür hale gelir',
      'Sayfa üstündeki puan rozetine tıklayınca puan geçmişi detayı açılır',
      'Müşteri sayfasını açıkken geri tuşuna basınca filtreniz kaybolmaz, listeye dönersiniz',
    ],
  },
  {
    icon: Calendar,
    color: 'bg-teal-600',
    title: 'Takvim & Takip',
    subtitle: 'Etkileşim zaman çizelgesi',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-2">
          <p className="font-semibold text-[11px] text-gray-700">Mehmet Yılmaz — Etkileşim Geçmişi</p>
          <div className="relative pl-4">
            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gray-200" />
            {[
              { icon: Phone, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Arama yapıldı', date: '24 Nis', note: 'Gübre siparişi sordu' },
              { icon: MapPin, color: 'text-green-600', bg: 'bg-green-50', label: 'Saha ziyareti', date: '18 Nis', note: 'Demo ürün bırakıldı' },
              { icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-50', label: 'WhatsApp notu', date: '10 Nis', note: 'Fiyat teklifi gönderildi' },
            ].map(item => (
              <div key={item.date} className="flex items-start gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${item.bg} flex items-center justify-center shrink-0 -ml-2.5 z-10`}>
                  <item.icon className={`w-2.5 h-2.5 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-[10px]">{item.label} <span className="text-gray-400">· {item.date}</span></p>
                  <p className="text-[10px] text-gray-500">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded p-1.5 flex items-center justify-between">
          <p className="text-[10px] text-teal-700 font-medium">Sonraki takip: 2 Mayıs</p>
          <AlertTriangle className="w-3 h-3 text-teal-500" />
        </div>
      </div>
    ),
    desc: 'Müşteri detay sayfasındaki Etkileşim sekmesi bir zaman çizelgesidir. Arama, ziyaret veya not ekleyebilirsiniz; tarih ve saat otomatik damgalanır. Sonraki takip tarihini de buradan belirleyin — o gün dashboard&apos;da hatırlatma çıkar. Mevsimsel bitki uyarıları da bu zaman çizelgesinde görünür.',
    tips: [
      'Her aramadan sonra en az bir satır not girin — bu raporlarda "aktif müşteri" sayılmanızı sağlar',
      'Sonraki takip tarihi boş bırakılırsa sistem hatırlatma oluşturmaz',
      'Ziyaret tipi seçmek önemlidir: Arama / Ziyaret / Not — raporlarda ayrı gösterilir',
      'Mevsimsel uyarılar otomatiktir, siz sadece eylemi kaydedin',
    ],
  },
  {
    icon: ShoppingBag,
    color: 'bg-orange-600',
    title: 'Saha Satışı',
    subtitle: 'Sipariş oluştur — stoktan düş',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded p-2">
          <p className="text-[10px] text-gray-400 mb-1">Müşteri</p>
          <p className="font-semibold text-blue-700">Mehmet Yılmaz — İzmir</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-2 space-y-1.5">
          <p className="text-[10px] text-gray-400 font-medium">Ürünler</p>
          {[
            { name: 'Ecobor Bor Gübre 1 Lt', qty: '2 adet', price: '₺120', pts: '20 pt' },
            { name: 'Zeytin Özel Sprey', qty: '1 adet', price: '₺85', pts: '10 pt' },
          ].map(p => (
            <div key={p.name} className="flex items-center justify-between text-[10px]">
              <div>
                <p className="font-medium text-gray-800">{p.name}</p>
                <p className="text-gray-400">{p.qty} · {p.pts}</p>
              </div>
              <p className="font-bold text-eco-green">{p.price}</p>
            </div>
          ))}
        </div>
        <div className="bg-eco-green text-white rounded p-2 flex justify-between items-center">
          <span className="font-medium">Toplam</span>
          <span className="font-bold">₺325 · 50 puan</span>
        </div>
      </div>
    ),
    desc: 'Müşteri seçin, ürünleri ekleyin, miktar ve fiyatları belirleyin. Saha satışı araç stoğunuzdan düşer; depo satışı merkezi stoktan düşer. Sipariş kaydedildiğinde müşterinin toplam puanı otomatik güncellenir. İstediğinizde siparişe kargo bilgisi de ekleyebilirsiniz.',
    tips: [
      'Saha satışı araç stoğunuzu düşürür — stoğunuz yoksa sistem uyarı verir',
      'Fiyatı manuel değiştirebilirsiniz, sistem liste fiyatını öneri olarak gösterir',
      'Sipariş kaydedilince müşteri puanı anında güncellenir, siz tekrar girmenize gerek yok',
      'Sipariş kaydı sonrası "Kargo Ekle" butonu belirir — teslim üstü satışlarda bu adımı atlayabilirsiniz',
      'Bir siparişe birden fazla ürün ekleyebilirsiniz — her satır için + düğmesine basın',
    ],
  },
  {
    icon: Truck,
    color: 'bg-blue-800',
    title: 'Kargo Takibi',
    subtitle: '4 aşamalı gönderi durumu',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-[11px]">Sipariş #ECO2025-041</p>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">Yolda</span>
          </div>
          <div className="flex items-center gap-1 mb-1.5">
            {[
              { label: 'Hazırlanıyor', done: true },
              { label: 'Kargoya Verildi', done: true },
              { label: 'Yolda', done: true },
              { label: 'Teslim Edildi', done: false },
            ].map((s, i) => (
              <div key={s.label} className="flex-1 text-center">
                <div className={`h-1.5 rounded-full mb-1 ${s.done ? 'bg-eco-green' : 'bg-gray-200'}`} />
                <p className={`text-[8px] leading-tight ${s.done ? 'text-eco-green font-medium' : 'text-gray-400'}`}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
            <Truck className="w-3 h-3" />
            <span>Yurtiçi Kargo · TR123456789</span>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-1.5 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
          <p className="text-[10px] text-gray-600">Müşteri panelinden kargo takip edebilir</p>
        </div>
      </div>
    ),
    desc: 'Sipariş oluşturduktan sonra kargo bilgilerini ekleyin: kargo şirketi (Yurtiçi, MNG, PTT vb.) ve takip numarası. Durum 4 aşamada ilerler: Hazırlanıyor → Kargoya Verildi → Yolda → Teslim Edildi. Durumu siz güncellediğinizde müşteri de kendi panelinden görebilir.',
    tips: [
      'Takip numarasını kargo fişinden girin — harf ve rakamları doğru girin, boşluk olmadan',
      '"Demo Simüle Et" butonu ile kargo adımlarını test modunda ilerletebilirsiniz',
      'Müşteri WhatsApp\'tan "kargom nerede?" diye sorarsa takip numarasını bu sayfadan kopyalayın',
      'Teslim Edildi seçildiğinde sipariş otomatik olarak kapatılır',
    ],
  },
  {
    icon: Gift,
    color: 'bg-yellow-600',
    title: 'Hediye Yönetimi',
    subtitle: 'Puan eşiğini geçen müşteriler',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded p-1.5">
          <Search className="w-3 h-3 text-gray-400" />
          <p className="text-gray-400 text-[10px]">Müşteri ara...</p>
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Mehmet Yılmaz', points: 850, eligible: true, threshold: 500 },
            { name: 'Fatma Kaya', points: 420, eligible: false, threshold: 500 },
          ].map(c => (
            <div key={c.name} className={`bg-white border rounded-lg p-2 ${c.eligible ? 'border-eco-green/40' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full ${c.eligible ? 'bg-eco-green' : 'bg-gray-300'} text-white text-[10px] flex items-center justify-center font-bold`}>
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[11px]">{c.name}</p>
                    <p className={`text-[10px] ${c.eligible ? 'text-eco-green font-medium' : 'text-gray-400'}`}>
                      {c.points} / {c.threshold} puan
                    </p>
                  </div>
                </div>
                {c.eligible && (
                  <span className="bg-eco-green text-white text-[9px] px-1.5 py-0.5 rounded-lg font-medium">Hediye Verildi</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-eco-green inline-block" /> Yeşil avatar = hediye hakkı kazanmış
        </p>
      </div>
    ),
    desc: 'Bu ekranda ad arama yaparak müşteri bulun. Yeşil avatar puan eşiğini geçmiş, hediye almaya hak kazanmış müşteriyi gösterir. Müşteri kartını genişletin, uygun ödülleri görün ve "Hediye Verildi" butonuna basın — puan otomatik düşülür, işlem kaydedilir.',
    tips: [
      'Yeşil avatarlı müşterileri önce listeleyin — üst sıralanırlar',
      '"Hediye Verildi" bastıktan sonra puan anında düşer, geri almak için admin\'e başvurun',
      'Eşik miktarı admin tarafından belirlenir — birden fazla ödül kademesi olabilir (Bronz / Gümüş / Altın)',
      'Müşteri talep etmeden siz de inisiyatif alıp verebilirsiniz — işlem kayıt altına alınır',
    ],
  },
  {
    icon: Package,
    color: 'bg-slate-600',
    title: 'Araç Stoğum',
    subtitle: 'Kendi araç envanterinizi takip edin',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-3 px-2 py-1">
            <p className="text-[10px] font-semibold text-gray-500">Ürün</p>
            <p className="text-[10px] font-semibold text-gray-500 text-center">Birim</p>
            <p className="text-[10px] font-semibold text-gray-500 text-right">Stok</p>
          </div>
          {[
            { name: 'Ecobor Bor Gübre', unit: 'Lt', qty: 3, low: true },
            { name: 'Zeytin Özel Sprey', unit: 'Lt', qty: 18, low: false },
            { name: 'Yaprak Gübre', unit: 'Kg', qty: 7, low: false },
          ].map(p => (
            <div key={p.name} className={`grid grid-cols-3 px-2 py-1.5 border-b border-gray-100 ${p.low ? 'bg-red-50' : ''}`}>
              <p className={`text-[10px] font-medium ${p.low ? 'text-red-700' : 'text-gray-800'}`}>{p.name}</p>
              <p className="text-[10px] text-gray-500 text-center">{p.unit}</p>
              <p className={`text-[10px] font-bold text-right ${p.low ? 'text-red-600' : 'text-eco-green'}`}>
                {p.qty} {p.low && '⚠️'}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-red-600 flex items-center gap-1 bg-red-50 rounded p-1.5 border border-red-200">
          <AlertTriangle className="w-3 h-3 shrink-0" /> Kırmızı satır = minimum eşiğin altında
        </p>
      </div>
    ),
    desc: 'Aracınızda taşıdığınız ürünlerin envanterini bu ekranda takip edin. Saha satışı yaptığınızda stok otomatik düşer. Kırmızı satır minimum eşiğin altına düşmüş ürünü gösterir — yenileme talebi açabilirsiniz. Admin size yeni stok atadığında burada güncellenir.',
    tips: [
      'Stok düşünce sistem sizi bildirim ile uyarır — bildirimlere izin verin',
      'Kırmızı stok satırına tıklayınca "Stok Talebi Oluştur" butonu çıkar',
      'Saha satışı sırasında stok sıfıra düşerse sistem sizi engellemez ama uyarır — dikkatli olun',
      'Fiziksel sayım ile sistem rakamı tutmazsa admin\'e bildirin, stok düzeltme yapılabilir',
    ],
  },
  {
    icon: Upload,
    color: 'bg-gray-700',
    title: 'Veri Aktar (Excel Import)',
    subtitle: '.xlsx dosyasıyla toplu müşteri yükleme',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="border-2 border-dashed border-eco-green/40 rounded-xl p-3 text-center bg-eco-green/5">
          <Upload className="w-6 h-6 text-eco-green mx-auto mb-1" />
          <p className="text-eco-green font-semibold text-[11px]">Excel dosyasını sürükleyin veya seçin</p>
          <p className="text-gray-400 text-[10px]">Yalnızca .xlsx formatı desteklenir</p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-1.5">
          <p className="text-[10px] font-semibold text-gray-600 mb-1">Sütun Sırası (A → K)</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            {[
              'A: Tarih', 'B: Ad Soyad', 'C: Şehir', 'D: Telefon',
              'E: Eski/Yeni', 'F: Satış Miktarı', 'G: Satış Durumu', 'H: Kaynak',
              'I: Ne Görüşüldü', 'J: Not', 'K: Hangi Bitki',
            ].map(col => (
              <p key={col} className="text-[9px] text-gray-600">{col}</p>
            ))}
          </div>
        </div>
        <div className="bg-eco-green/10 border border-eco-green/20 rounded p-1.5">
          <p className="text-eco-green font-semibold text-[11px] flex items-center gap-1">
            <CheckSquare className="w-3 h-3" /> Import tamamlandı
          </p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            <div className="bg-white rounded text-center py-1"><p className="font-bold text-eco-green text-sm">5.941</p><p className="text-[9px] text-gray-500">Eklendi</p></div>
            <div className="bg-white rounded text-center py-1"><p className="font-bold text-gray-400 text-sm">12</p><p className="text-[9px] text-gray-500">Atlandı</p></div>
            <div className="bg-white rounded text-center py-1"><p className="font-bold text-sm">5.953</p><p className="text-[9px] text-gray-500">Toplam</p></div>
          </div>
        </div>
      </div>
    ),
    desc: 'Elinizdeki Excel listesini sisteme yükleyin. Sütun sırası A\'dan K\'ya şu şekilde olmalıdır: Tarih, Ad Soyad, Şehir, Telefon, Eski/Yeni, Satış Miktarı, Satış Durumu, Kaynak, Ne Görüşüldü, Not, Hangi Bitki. Aynı telefon numarasına sahip kayıtlar otomatik atlanır (deduplication). Yüklenen veriler size atanır.',
    tips: [
      'Sütun başlıklarını silmeyin — sistem ilk satırı başlık olarak okur, ikinci satırdan itibaren veri alır',
      'Telefon sütununda 05XX formatı kullanın — başında 0 olmayan numaralar eşleşmeyebilir',
      'Aynı telefon numarası zaten kayıtlıysa atlanır, üzerine yazılmaz — güvenlidir',
      'K sütunundaki bitki adları virgülle ayrılmışsa her biri ayrı etiket olarak eklenir',
      'Yükleme öncesi dosyayı .xlsx olarak kaydettiğinizden emin olun — .xls veya .csv çalışmaz',
    ],
  },
];

// ─── Admin Rehber Adımları (7 adım) ───────────────────────────────────────────
const ADMIN_STEPS = [
  {
    icon: LayoutDashboard,
    color: 'bg-eco-green',
    title: 'Admin Dashboard',
    subtitle: 'Tam sistem görünümü',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Toplam Müşteri', value: '247', color: 'text-eco-green', bg: 'bg-eco-green/10' },
            { label: 'Aktif Sipariş', value: '38', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Aylık Ciro', value: '₺148K', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Aktif Kullanıcı', value: '6', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-gray-200 rounded-lg p-2 text-center`}>
              <p className={`font-bold text-xl leading-none ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Aylık Ciro Trendi</p>
          <div className="flex items-end gap-1 h-8">
            {[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-eco-green/20 rounded-sm" style={{ height: `${h}%` }}>
                <div className="bg-eco-green rounded-sm w-full" style={{ height: `${i === 5 ? 100 : i === 6 ? 94 : 60}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-1">
            <span>Ekim</span><span>Nis</span>
          </div>
        </div>
      </div>
    ),
    desc: 'Admin olarak giriş yaptığınızda tüm sistem verisini görürsünüz: tüm mühendislerin müşterileri, toplam sipariş sayısı, aylık ciro ve aktif kullanıcı sayısı. Aylık ciro grafiği son 7 ayı gösterir. Buradan herhangi bir mühendise, müşteriye veya siparişe erişebilirsiniz.',
    tips: [
      'Ciro grafiğindeki çubuklara tıklayınca o aya ait detay rapor açılır',
      'Anasayfada kırmızı uyarı varsa acil stok veya kullanıcı sorunu var demektir — önce bunu inceleyin',
      'Sağ üst köşedeki zil simgesi tüm sistem bildirimlerini gösterir',
      'Dashboard verileri her 5 dakikada bir otomatik yenilenir',
    ],
  },
  {
    icon: Users,
    color: 'bg-blue-600',
    title: 'Kullanıcı Yönetimi',
    subtitle: 'Personel ekle, düzenle, devre dışı bırak',
    visual: (
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-[11px] text-gray-700">Kullanıcılar (4)</p>
          <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-0.5"><Plus className="w-2.5 h-2.5" />Ekle</span>
        </div>
        {[
          { name: 'Buse Yılmaz', role: 'Mühendis', phone: '0541 113 40 35', status: 'Aktif', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
          { name: 'Ali Demir', role: 'Saha Temsilcisi', phone: '0532 284 75 61', status: 'Aktif', color: 'bg-teal-50 text-teal-700', dot: 'bg-green-500' },
          { name: 'Müdür Mehmet', role: 'Müdür', phone: '0555 333 22 11', status: 'Pasif', color: 'bg-blue-50 text-blue-700', dot: 'bg-gray-400' },
        ].map(u => (
          <div key={u.name} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-eco-green text-white text-[10px] flex items-center justify-center font-bold">{u.name[0]}</div>
                <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${u.dot}`} />
              </div>
              <div>
                <p className="font-semibold text-[11px]">{u.name}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-0.5"><Phone className="w-2 h-2" />{u.phone}</p>
              </div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${u.color}`}>{u.role}</span>
          </div>
        ))}
      </div>
    ),
    desc: 'Sisteme Mühendis, Müdür veya Saha Temsilcisi rolünde kullanıcı ekleyebilirsiniz. Giriş için telefon numarası ve şifre belirlenir. Kullanıcıyı devre dışı bırakmak (kırmızı toggle) hesabı silmez, sadece erişimi kapatır. Uzak erişim iznini de bu sayfadan açıp kapatırsınız.',
    tips: [
      'Şifre belirlerken kullanıcıya özel güçlü bir şifre kullanın — sistem minimum 8 karakter ister',
      'Ayrılmış personeli silmeyin, "Pasif" yapın — geçmiş müşteri verileri korunur',
      'Uzak Erişim toggle\'ı bu sayfada da vardır, detay Uzak Erişim adımında anlatılmıştır',
      'Rol değiştirmek için kullanıcı satırındaki kalem simgesine tıklayın',
    ],
  },
  {
    icon: Users,
    color: 'bg-indigo-600',
    title: 'Tüm Müşteriler',
    subtitle: 'Mühendis, durum ve bölge filtresi',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="flex gap-1 flex-wrap">
          {['Tüm Mühendsler', 'Buse Y.', 'Ali D.'].map((f, i) => (
            <span key={f} className={`px-2 py-0.5 rounded-full text-[10px] ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{f}</span>
          ))}
        </div>
        <div className="flex gap-1">
          {['Durum ▾', 'Bölge ▾', 'Bitki ▾'].map(f => (
            <span key={f} className="bg-white border border-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{f}</span>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 grid grid-cols-4 px-2 py-1 border-b border-gray-200">
            {['Müşteri', 'Mühendis', 'Durum', 'Şehir'].map(h => (
              <p key={h} className="text-[9px] font-semibold text-gray-500">{h}</p>
            ))}
          </div>
          {[
            { name: 'Mehmet Y.', eng: 'Buse Y.', status: 'Önemli', city: 'İzmir' },
            { name: 'Fatma K.', eng: 'Ali D.', status: 'Yeni', city: 'Manisa' },
          ].map(r => (
            <div key={r.name} className="grid grid-cols-4 px-2 py-1.5 border-b border-gray-100 text-[10px]">
              <p className="font-medium text-gray-800">{r.name}</p>
              <p className="text-gray-500">{r.eng}</p>
              <p className="text-blue-600">{r.status}</p>
              <p className="text-gray-500">{r.city}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    desc: 'Tüm mühendislerin müşterilerini tek ekranda görebilirsiniz. Mühendis, durum (Yeni/Eski/Önemli/Potansiyel), bölge (il) ve bitki türüne göre filtre uygulayın. Herhangi bir müşteriye tıklayarak detay sayfasına girebilir, not ekleyebilir, siparişleri görebilirsiniz.',
    tips: [
      'Mühendis filtresi ile tek kişinin portföyünü izole edip inceleyebilirsiniz',
      'Tablo başlıklarına tıklayarak alfabetik veya tarih bazlı sıralama yapabilirsiniz',
      'Filtrelenmiş görünüm Excel\'e aktarılabilir — Rapor sayfasındaki "Dışa Aktar" ile',
      'Admin olarak müşteri düzenleyebilir ve mühendis ataması değiştirebilirsiniz',
    ],
  },
  {
    icon: Package,
    color: 'bg-orange-600',
    title: 'Ürün & Stok Yönetimi',
    subtitle: 'Envanter, fiyat, puan ve mühendis ataması',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-[11px] text-gray-700">Ürünler</p>
          <span className="bg-orange-600 text-white text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-0.5"><Plus className="w-2.5 h-2.5" />Ürün Ekle</span>
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Ecobor Bor Gübre 1 Lt', price: '₺65', pts: '10 pt', stock: 3, min: 10, low: true },
            { name: 'Zeytin Özel Sprey 5 Lt', price: '₺220', pts: '35 pt', stock: 48, min: 5, low: false },
            { name: 'Yaprak Gübre 500 gr', price: '₺42', pts: '5 pt', stock: 22, min: 10, low: false },
          ].map(p => (
            <div key={p.name} className={`bg-white border rounded-lg p-2 ${p.low ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <p className={`font-semibold text-[10px] ${p.low ? 'text-red-700' : 'text-gray-800'}`}>{p.name}</p>
                <div className="flex gap-1">
                  <span className="text-eco-green font-bold text-[10px]">{p.price}</span>
                  <span className="bg-yellow-50 text-yellow-700 text-[9px] px-1 rounded">{p.pts}</span>
                </div>
              </div>
              {p.low && (
                <p className="text-red-600 text-[9px] flex items-center gap-0.5 mt-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />Düşük stok: {p.stock} adet kaldı (min: {p.min})
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    desc: 'Sisteme ürün ekleyin, liste fiyatı ve puan değerini belirleyin. Her ürün için minimum stok eşiği tanımlayabilirsiniz — bu eşiğin altına düşünce kırmızı uyarı gösterilir. Mühendislere araç stoğu ataması da bu ekrandan yapılır: ürün satırını açın, "Mühendise Ata" butonuna basın.',
    tips: [
      'Puan değeri ürünün satış teşvik değeridir — daha yüksek puan = müşteri o ürünü tercih eder',
      'Minimum stok eşiğini gerçekçi ayarlayın: çok düşük ayarlarsanız uyarılar anlamsızlaşır',
      'Mühendise stok atarken miktar girin — mühendis bu miktardan satış yapar',
      'Ürün fiyatını değiştirince yeni siparişlere yansır, eski siparişler etkilenmez',
      'Pasif yapılan ürünler mühendis ekranında görünmez, satış yapılamaz',
    ],
  },
  {
    icon: Award,
    color: 'bg-yellow-600',
    title: 'Ödül Kuralları',
    subtitle: 'Puan kademesi ve hediye tanımları',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-[11px] text-gray-700">Ödül Kademeleri</p>
          <span className="bg-yellow-600 text-white text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-0.5"><Plus className="w-2.5 h-2.5" />Kural Ekle</span>
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Bronz Hediye', points: 500, desc: 'Küçük tarım seti', icon: '🥉', active: true },
            { name: 'Gümüş Hediye', points: 1000, desc: 'Orta paket + şapka', icon: '🥈', active: true },
            { name: 'Altın Hediye', points: 2000, desc: 'Premium tarım paketi', icon: '🥇', active: false },
          ].map(r => (
            <div key={r.name} className={`bg-white border rounded-lg p-2 flex items-center gap-2 ${r.active ? 'border-yellow-200' : 'border-gray-200 opacity-60'}`}>
              <span className="text-lg leading-none">{r.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[11px]">{r.name}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${r.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {r.active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-gray-500">{r.desc}</p>
                  <p className="text-eco-green font-bold text-[10px]">{r.points} puan</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    desc: 'Kaç puana hangi hediyenin verileceğini bu ekranda tanımlarsınız. Bronz / Gümüş / Altın gibi kademeler oluşturabilir, her birine puan eşiği ve açıklama ekleyebilirsiniz. Pasif yapılan ödüller müşteri ve mühendis ekranında görünmez. Mühendis hediyeyi bu listeden seçerek "Hediye Verildi" işaretler.',
    tips: [
      'Puan eşiklerini gerçekçi tutun — çok yüksek eşik motivasyonu düşürür',
      'Hediye açıklaması mühendis ekranında da gösterilir — "Küçük tarım seti (₺150 değerinde)" gibi detaylı yazın',
      'Pasif ödüller tamamen gizlenir — sezona göre aktif/pasif yapabilirsiniz',
      'Ödül silmek yerine pasif yapın — geçmiş hediye kayıtları korunur',
    ],
  },
  {
    icon: BarChart2,
    color: 'bg-purple-600',
    title: 'Raporlar',
    subtitle: 'Satış, müşteri ve performans analizleri',
    visual: (
      <div className="space-y-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <p className="font-semibold text-[11px] mb-2">Mühendis Bazlı Satış (Nisan 2025)</p>
          {[
            { name: 'Buse Yılmaz', pct: 85, amount: '₺63.400' },
            { name: 'Ali Demir', pct: 60, amount: '₺44.900' },
            { name: 'Selin Kaya', pct: 40, amount: '₺29.800' },
          ].map(r => (
            <div key={r.name} className="mb-2">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="font-medium">{r.name}</span>
                <span className="text-eco-green font-bold">{r.amount}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-eco-green rounded-full" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 bg-purple-50 border border-purple-200 rounded p-1.5 text-center">
            <p className="text-purple-700 font-bold text-[13px]">+18%</p>
            <p className="text-[9px] text-purple-600">Geçen aya göre</p>
          </div>
          <div className="flex-1 bg-eco-green/10 border border-eco-green/20 rounded p-1.5 text-center">
            <p className="text-eco-green font-bold text-[13px]">Excel</p>
            <p className="text-[9px] text-eco-green">Dışa Aktar</p>
          </div>
        </div>
      </div>
    ),
    desc: 'Mühendis başına satış, aylık ciro, müşteri edinim kaynağı ve bölge bazlı dağılım raporlarını buradan inceleyin. Tarih aralığı filtresi ile dilediğiniz dönemi seçebilirsiniz. Tüm raporlar Excel\'e aktarılabilir.',
    tips: [
      '"Excel İndir" butonu filtrelenmiş görünümü dışa aktarır — önce filtre uygulayın',
      'Tarih aralığını daraltmak (örn. tek ay) raporu hızlandırır',
      'Kaynak dağılımı (Reklam / Tavsiye / Saha) hangi kanalın işe yaradığını gösterir',
      'Aylık karşılaştırma çubuğu trend analizi için kullanışlıdır — düşüş görünce ilgili mühendisle görüşün',
    ],
  },
  {
    icon: Shield,
    color: 'bg-gray-800',
    title: 'Uzak Erişim Yönetimi',
    subtitle: 'Dışarıdan bağlantı — otomatik 7 gün süresi',
    visual: (
      <div className="space-y-2 text-xs">
        <p className="text-[10px] text-gray-600 bg-gray-50 border border-gray-200 rounded p-1.5">
          Uzak erişim açılan kullanıcılar şirket dışından sisteme bağlanabilir.
        </p>
        <div className="space-y-1.5">
          {[
            { name: 'Buse Yılmaz', role: 'Mühendis', active: true, days: '5 gün kaldı' },
            { name: 'Ali Demir', role: 'Saha Temsilcisi', active: false, days: null },
            { name: 'Selin Kaya', role: 'Mühendis', active: true, days: '2 gün kaldı' },
          ].map(u => (
            <div key={u.name} className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-eco-green/10 flex items-center justify-center">
                  <Shield className={`w-3.5 h-3.5 ${u.active ? 'text-eco-green' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-semibold text-[11px]">{u.name}</p>
                  <p className={`text-[10px] ${u.active ? 'text-eco-green' : 'text-gray-400'}`}>
                    {u.active ? u.days : `${u.role} · Kapalı`}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full flex items-center transition-colors ${u.active ? 'bg-eco-green justify-end pr-0.5' : 'bg-gray-300 justify-start pl-0.5'}`}>
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded p-1.5 flex items-start gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700">Uzak erişim açıldığında 7 gün sonra otomatik kapanır.</p>
        </div>
      </div>
    ),
    desc: 'Personelin şirket dışından (ev, arazi, vb.) sisteme bağlanabilmesi için bu sayfadan toggle açın. Erişim açıldığında 7 günlük süre otomatik atanır; süre dolunca bağlantı kapanır. Süre dolmadan da kapatabilirsiniz. Kalan süre her kullanıcı satırında gösterilir.',
    tips: [
      'Toggle açar açmaz 7 gün sayacı başlar — sabah açarsanız 7 gün sonra sabah kapanır',
      'Acil durumlarda toggle\'ı kapatmak anlık olarak erişimi keser',
      'Erişim kapandıktan sonra kullanıcı sisteme bağlanamaz — yeniden açmanız gerekir',
      'Güvenlik için gereksiz uzak erişimleri kapalı tutun',
      'Bu sayfa aynı zamanda Kullanıcı Yönetimi sayfasındaki düzenle menüsünden de açılabilir',
    ],
  },
];

type Step = (typeof ENGINEER_STEPS)[number];

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
              <span className="text-sm opacity-80 font-medium">Kullanım Kılavuzu</span>
            </div>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{step.title}</h2>
              <p className="text-sm opacity-80 mt-0.5">{step.subtitle}</p>
            </div>
          </div>
          {/* Step dots */}
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/35 w-1.5 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Visual mockup */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            {step.visual}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">{step.desc}</p>

          {/* Tips */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              Pratik İpuçları
            </p>
            <div className="space-y-2">
              {step.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <div className="w-5 h-5 rounded-full bg-eco-green text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0 bg-white">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
            Önceki
          </button>
          <span className="text-xs text-gray-400 font-medium">
            {current + 1} / {steps.length}
          </span>
          {current < steps.length - 1 ? (
            <button
              onClick={() => setCurrent(current + 1)}
              className="flex items-center gap-1 text-sm text-eco-green font-semibold hover:text-eco-green-dk transition-colors"
            >
              Sonraki
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-sm bg-eco-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-eco-green-dk transition-colors"
            >
              Tamamdır
              <CheckSquare className="w-3.5 h-3.5" />
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

  const roleLabel =
    role === 'ADMIN' ? 'Admin' : role === 'MANAGER' ? 'Müdür' : 'Mühendis';

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

  const popupFeatures =
    role === 'ADMIN'
      ? [
          { icon: Users, label: 'Kullanıcı Yönetimi' },
          { icon: BarChart2, label: 'Raporlar & Analizler' },
          { icon: Package, label: 'Stok & Ürünler' },
          { icon: Shield, label: 'Uzak Erişim Kontrolü' },
        ]
      : [
          { icon: Users, label: 'Müşteri Yönetimi' },
          { icon: ShoppingBag, label: 'Saha Satışı' },
          { icon: Truck, label: 'Kargo Takibi' },
          { icon: Gift, label: 'Hediye Yönetimi' },
        ];

  return (
    <>
      {/* ── Welcome Popup ─────────────────────────────────────────────────── */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="bg-eco-green p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Hoş Geldiniz!</h2>
              <p className="text-white/85 text-sm mt-1">
                {userName ? `Merhaba ${userName} — ` : ''}
                Ecobor CRM&apos;e hoş geldiniz
              </p>
              <span className="inline-block mt-2 bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                {roleLabel} Paneli
              </span>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {popupFeatures.map(({ icon: FeatureIcon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 bg-eco-bg rounded-xl p-3 border border-eco-border"
                  >
                    <FeatureIcon className="w-4 h-4 text-eco-green shrink-0" />
                    <span className="font-medium text-eco-text">{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-eco-gray text-center leading-relaxed">
                Sistemi ilk kez mi kullanıyorsunuz? Kılavuzu açarak her
                özelliği adım adım öğrenin —{' '}
                <span className="font-semibold text-eco-green">
                  {steps.length} detaylı adım
                </span>{' '}
                sizi bekliyor.
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
                    className="py-2.5 rounded-xl border border-eco-border text-eco-gray text-sm hover:bg-eco-bg transition-colors font-medium"
                  >
                    Daha Sonra
                  </button>
                  <button
                    onClick={() => dismiss(true)}
                    className="py-2.5 rounded-xl border border-eco-border text-eco-gray text-sm hover:bg-eco-bg transition-colors font-medium"
                  >
                    Bir Daha Gösterme
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Guide Modal ───────────────────────────────────────────────────── */}
      {showGuide && (
        <GuideModal steps={steps} onClose={() => setShowGuide(false)} />
      )}

      {/* ── Floating ? button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setShowGuide(true)}
        title="Kullanım Kılavuzu"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-eco-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-eco-green-dk transition-colors group"
      >
        <BookOpen className="w-5 h-5" />
        <span className="absolute right-14 bg-gray-800 text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Kullanım Kılavuzu
        </span>
      </button>
    </>
  );
}
