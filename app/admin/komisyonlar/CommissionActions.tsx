'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function CommissionActions({ id }: { id: string }) {
  const [done, setDone] = useState(false);

  async function update(status: 'approved' | 'rejected') {
    await fetch(`/api/admin/commissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setDone(true);
  }

  if (done) return <span className="text-xs text-eco-gray">Güncellendi</span>;

  return (
    <div className="flex gap-2">
      <button onClick={() => update('approved')} className="eco-btn-secondary text-xs px-2 py-1">
        <Check className="w-3 h-3" />Onayla
      </button>
      <button onClick={() => update('rejected')} className="eco-btn-danger text-xs px-2 py-1">
        <X className="w-3 h-3" />Reddet
      </button>
    </div>
  );
}
