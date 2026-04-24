'use client';
import { Phone, MapPin, StickyNote } from 'lucide-react';
import { clsx } from 'clsx';

interface Interaction {
  id: string;
  date: string;
  type: 'call' | 'visit' | 'note';
  note: string | null;
  next_followup: string | null;
  engineer?: { name: string };
}

const typeConfig = {
  call:  { icon: Phone,     label: 'Arama',  color: 'bg-eco-green text-white' },
  visit: { icon: MapPin,    label: 'Ziyaret', color: 'bg-eco-info text-white' },
  note:  { icon: StickyNote, label: 'Not',   color: 'bg-eco-warning text-white' },
};

export function InteractionTimeline({ items }: { items: Interaction[] }) {
  if (!items.length) {
    return <p className="text-sm text-eco-gray py-4">Henüz etkileşim kaydı yok.</p>;
  }

  return (
    <ol className="relative ml-3 border-l-2 border-eco-border space-y-6">
      {items.map((item) => {
        const cfg = typeConfig[item.type] ?? typeConfig.note;
        const Icon = cfg.icon;
        return (
          <li key={item.id} className="pl-6 relative">
            <span className={clsx('absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full', cfg.color)}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-eco-green-lt">{cfg.label}</span>
                {item.engineer && (
                  <span className="ml-2 text-xs text-eco-gray">· {item.engineer.name}</span>
                )}
                {item.note && <p className="mt-1 text-sm text-eco-text">{item.note}</p>}
                {item.next_followup && (
                  <p className="mt-1 text-xs text-eco-warning">
                    Takip: {new Date(item.next_followup).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </div>
              <time className="shrink-0 text-xs text-eco-gray">
                {new Date(item.date).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
