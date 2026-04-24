'use client';

import { useState, useEffect } from 'react';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { CheckSquare, Calendar } from 'lucide-react';

export default function GorevlerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/engineer/tasks').then((r) => r.json()).then((d) => { setTasks(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function complete(id: string) {
    await fetch(`/api/admin/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    setTasks((p) => p.map((t) => t.id === id ? { ...t, status: 'done' } : t));
  }

  const pending = tasks.filter((t) => t.status === 'pending');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const done = tasks.filter((t) => t.status === 'done');

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-eco-text">Görevlerim</h1>
      {loading ? <p className="text-eco-gray">Yükleniyor...</p> : (
        <div className="space-y-4">
          {[{ status: 'pending', list: pending }, { status: 'in_progress', list: inProgress }, { status: 'done', list: done }].map(({ status, list }) => {
            const { label, variant } = statusBadge(status);
            return (
              <div key={status} className="bg-white rounded-xl shadow-card border border-eco-border">
                <div className="flex items-center gap-2 p-4 border-b border-eco-border">
                  <Badge variant={variant}>{label}</Badge>
                  <span className="text-xs text-eco-gray">{list.length} görev</span>
                </div>
                <div className="divide-y divide-eco-border">
                  {list.map((t: any) => (
                    <div key={t.id} className="flex items-start gap-4 px-4 py-3">
                      <div className="flex-1">
                        <p className="font-medium text-eco-text text-sm">{t.title}</p>
                        {t.description && <p className="text-xs text-eco-text-2 mt-0.5">{t.description}</p>}
                        {t.customer?.name && <p className="text-xs text-eco-gray mt-0.5">Müşteri: {t.customer.name}</p>}
                        {t.due_date && (
                          <p className="flex items-center gap-1 text-xs text-eco-warning mt-1">
                            <Calendar className="w-3 h-3" />{formatDate(t.due_date)}
                          </p>
                        )}
                      </div>
                      {status !== 'done' && (
                        <button onClick={() => complete(t.id)} className="flex items-center gap-1 text-xs text-eco-green hover:underline mt-0.5">
                          <CheckSquare className="w-4 h-4" />Tamamla
                        </button>
                      )}
                    </div>
                  ))}
                  {!list.length && <p className="text-xs text-eco-gray text-center py-6">Görev yok</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
