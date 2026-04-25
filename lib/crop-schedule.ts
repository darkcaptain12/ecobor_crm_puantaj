export type CropStage = {
  dayFrom: number;
  dayTo: number;
  label: string;
  description: string;
  products: string[];
  priority: 'critical' | 'high' | 'medium';
};

// Kültür tipine göre dönemsel uygulama takvimi
// dayFrom/dayTo: ekim tarihinden kaç gün sonra
export const CROP_SCHEDULES: Record<string, CropStage[]> = {
  Zeytin: [
    {
      dayFrom: 20, dayTo: 40,
      label: 'Çiçeklenme Öncesi',
      description: 'Bor eksikliği çiçek dökümüne yol açar. EC BOR uygulaması kritik.',
      products: ['EC BOR 2 LT', 'EC BOR 1 LT'],
      priority: 'critical',
    },
    {
      dayFrom: 55, dayTo: 80,
      label: 'Meyve Tutumu',
      description: 'Meyve tutumunu artırmak için EC BOR + yaprak gübre kombinasyonu.',
      products: ['EC BOR 5 LT', 'Yaprak Gübre 1 LT'],
      priority: 'critical',
    },
    {
      dayFrom: 120, dayTo: 160,
      label: 'Meyve Büyüme',
      description: 'Yağ oranını artırmak için yaprak gübre takviyesi.',
      products: ['Yaprak Gübre 5 LT'],
      priority: 'high',
    },
  ],
  Domates: [
    {
      dayFrom: 10, dayTo: 20,
      label: 'Fide Tutma',
      description: 'Kök gelişimi için Kök Geliştirici + EC BOR.',
      products: ['Kök Geliştirici 500ML', 'EC BOR 1 LT'],
      priority: 'high',
    },
    {
      dayFrom: 28, dayTo: 42,
      label: 'Çiçeklenme',
      description: 'EC BOR ile çiçek tutumunu artır, meyve seti sağla.',
      products: ['EC BOR 1 LT', 'Yaprak Gübre 1 LT'],
      priority: 'critical',
    },
    {
      dayFrom: 50, dayTo: 65,
      label: 'Meyve Büyüme',
      description: 'Meyve kalitesi ve büyüklüğü için EC BOR devam.',
      products: ['EC BOR 2 LT'],
      priority: 'high',
    },
  ],
  Buğday: [
    {
      dayFrom: 14, dayTo: 25,
      label: 'Çıkış Dönemi',
      description: 'Fide çıkışı için yaprak gübre ve bor desteği.',
      products: ['Yaprak Gübre 1 LT', 'EC BOR 1 LT'],
      priority: 'high',
    },
    {
      dayFrom: 45, dayTo: 60,
      label: 'Kardeşlenme',
      description: 'Verim için EC BOR uygulaması.',
      products: ['EC BOR 2 LT'],
      priority: 'critical',
    },
    {
      dayFrom: 80, dayTo: 100,
      label: 'Başaklanma',
      description: 'Tane dolumu için EC BOR + yaprak gübre.',
      products: ['EC BOR 5 LT', 'Yaprak Gübre 5 LT'],
      priority: 'critical',
    },
  ],
  Üzüm: [
    {
      dayFrom: 25, dayTo: 45,
      label: 'Sürgün Gelişimi',
      description: 'Sürgün büyümesi için EC BOR ve yaprak gübre.',
      products: ['EC BOR 1 LT', 'Yaprak Gübre 1 LT'],
      priority: 'high',
    },
    {
      dayFrom: 55, dayTo: 75,
      label: 'Çiçeklenme',
      description: 'Salkım tutumu için EC BOR kritik.',
      products: ['EC BOR 2 LT'],
      priority: 'critical',
    },
    {
      dayFrom: 90, dayTo: 120,
      label: 'Ben Düşme',
      description: 'Renk ve şeker gelişimi için yaprak gübre.',
      products: ['Yaprak Gübre 5 LT'],
      priority: 'high',
    },
  ],
  Pamuk: [
    {
      dayFrom: 18, dayTo: 30,
      label: 'Fide Gelişimi',
      description: 'Kök gelişimi ve fide tutma.',
      products: ['Kök Geliştirici 500ML', 'EC BOR 1 LT'],
      priority: 'high',
    },
    {
      dayFrom: 40, dayTo: 55,
      label: 'Çiçeklenme Öncesi',
      description: 'EC BOR ile koza tutumunu artır.',
      products: ['EC BOR 2 LT', 'Yaprak Gübre 1 LT'],
      priority: 'critical',
    },
    {
      dayFrom: 65, dayTo: 80,
      label: 'Koza Gelişimi',
      description: 'Koza kalitesi için EC BOR devam.',
      products: ['EC BOR 5 LT'],
      priority: 'high',
    },
  ],
  Fındık: [
    {
      dayFrom: 20, dayTo: 40,
      label: 'Çiçeklenme',
      description: 'Erkek/dişi çiçek uyumu için EC BOR.',
      products: ['EC BOR 1 LT'],
      priority: 'high',
    },
    {
      dayFrom: 60, dayTo: 90,
      label: 'İç Dolumu',
      description: 'Fındık iç dolumu için EC BOR kritik dönem.',
      products: ['EC BOR 5 LT', 'Yaprak Gübre 5 LT'],
      priority: 'critical',
    },
    {
      dayFrom: 100, dayTo: 130,
      label: 'Olgunlaşma',
      description: 'Son yaprak gübre takviyesi.',
      products: ['Yaprak Gübre 1 LT'],
      priority: 'medium',
    },
  ],
  Çilek: [
    {
      dayFrom: 7, dayTo: 18,
      label: 'Tutma Dönemi',
      description: 'Kök tutması için Kök Geliştirici.',
      products: ['Kök Geliştirici 500ML'],
      priority: 'critical',
    },
    {
      dayFrom: 20, dayTo: 35,
      label: 'Çiçeklenme',
      description: 'Meyve tutumu için EC BOR.',
      products: ['EC BOR 1 LT', 'Yaprak Gübre 1 LT'],
      priority: 'critical',
    },
    {
      dayFrom: 40, dayTo: 55,
      label: 'Meyve Büyüme',
      description: 'Meyve büyüklüğü ve kalitesi için EC BOR.',
      products: ['EC BOR 2 LT'],
      priority: 'high',
    },
  ],
};

// Verilen ekim tarihi ve kültür tipine göre aktif dönemleri döndür
export function getActiveStages(
  cropType: string,
  plantingDate: string | null
): (CropStage & { daysElapsed: number; daysLeft: number })[] {
  if (!plantingDate || !CROP_SCHEDULES[cropType]) return [];

  const planted = new Date(plantingDate);
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - planted.getTime()) / 86400_000);

  return CROP_SCHEDULES[cropType]
    .filter((s) => daysElapsed >= s.dayFrom && daysElapsed <= s.dayTo)
    .map((s) => ({ ...s, daysElapsed, daysLeft: s.dayTo - daysElapsed }));
}

// Gelecek 14 günde başlayacak dönemleri döndür
export function getUpcomingStages(
  cropType: string,
  plantingDate: string | null,
  lookAheadDays = 14
): (CropStage & { startsInDays: number })[] {
  if (!plantingDate || !CROP_SCHEDULES[cropType]) return [];

  const planted = new Date(plantingDate);
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - planted.getTime()) / 86400_000);

  return CROP_SCHEDULES[cropType]
    .filter(
      (s) =>
        s.dayFrom > daysElapsed &&
        s.dayFrom - daysElapsed <= lookAheadDays
    )
    .map((s) => ({ ...s, startsInDays: s.dayFrom - daysElapsed }));
}

export const priorityLabel: Record<CropStage['priority'], string> = {
  critical: 'Kritik',
  high: 'Önemli',
  medium: 'Normal',
};

export const priorityColor: Record<CropStage['priority'], string> = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-amber-600 bg-amber-50 border-amber-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
};
