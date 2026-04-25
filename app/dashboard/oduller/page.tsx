'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, Gift, CheckCircle, AlertCircle, Search, ChevronDown } from 'lucide-react';

export default function EngineerOduller() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [giving, setGiving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [custRes, rulesRes] = await Promise.all([
      fetch('/api/engineer/customers'),
      fetch('/api/admin/reward-rules'),
    ]);
    const [custData, rulesData] = await Promise.all([custRes.json(), rulesRes.json()]);
    setCustomers(Array.isArray(custData) ? custData : []);
    setRules(Array.isArray(rulesData) ? rulesData : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function giveReward(customerId: string, ruleId: string) {
    const key = `${customerId}-${ruleId}`;
    setGiving(key);
    setMessage(null);

    const res = await fetch('/api/engineer/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, reward_rule_id: ruleId }),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({ type: 'success', text: data.message });
      // Müşteri puanını local'de güncelle
      setCustomers(prev => prev.map(c =>
        c.id === customerId ? { ...c, total_points: data.remaining_points } : c
      ));
    } else {
      setMessage({ type: 'error', text: data.error });
    }
    setGiving(null);
    setTimeout(() => setMessage(null), 4000);
  }

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const eligible = (c: any) => rules.filter(r => r.points_required <= c.total_points);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-eco-text">Hediye Yönetimi</h1>
        <p className="text-sm text-eco-gray mt-0.5">Müşterilere kazandıkları hediyeleri işaretleyin</p>
      </div>

      {/* Bildirim */}
      {message && (
        <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
          message.type === 'success'
            ? 'bg-eco-green/10 text-eco-green border border-eco-green/20'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          {message.text}
        </div>
      )}

      {/* Ödül kuralları özeti */}
      {rules.length > 0 && (
        <div className="bg-white rounded-xl border border-eco-border p-4">
          <p className="text-xs font-semibold text-eco-gray uppercase tracking-wide mb-3">Ödül Kademeleri</p>
          <div className="flex flex-wrap gap-2">
            {rules.map((r: any) => (
              <div key={r.id} className="flex items-center gap-1.5 bg-eco-bg px-3 py-1.5 rounded-full text-xs">
                <Award className="w-3.5 h-3.5 text-eco-green" />
                <span className="font-semibold text-eco-text">{r.points_required} puan</span>
                <span className="text-eco-gray">→ {r.reward_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-gray" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Müşteri ara..."
          className="eco-input pl-9"
        />
      </div>

      {/* Müşteri listesi */}
      {loading ? (
        <div className="text-center py-12 text-eco-gray">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-eco-gray">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Müşteri bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => {
            const eligibleRewards = eligible(c);
            const isOpen = expanded === c.id;

            return (
              <div key={c.id} className="bg-white rounded-xl border border-eco-border overflow-hidden">
                {/* Müşteri satırı */}
                <button
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-eco-bg/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                      eligibleRewards.length > 0 ? 'bg-eco-green text-white' : 'bg-eco-bg text-eco-gray'
                    }`}>
                      {c.name?.[0] ?? '?'}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-eco-text truncate">{c.name}</p>
                      <p className="text-xs text-eco-gray">{c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-eco-green text-sm">{c.total_points?.toLocaleString('tr-TR')} puan</p>
                      {eligibleRewards.length > 0 && (
                        <p className="text-xs text-eco-green">{eligibleRewards.length} hediye hakkı</p>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-eco-gray transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Açılır ödül seçimi */}
                {isOpen && (
                  <div className="border-t border-eco-border p-4 bg-eco-bg/30">
                    {eligibleRewards.length === 0 ? (
                      <p className="text-sm text-eco-gray text-center py-2">
                        Henüz hediye hakkı kazanılmadı
                        {rules.length > 0 && (
                          <span className="block mt-1 text-xs">
                            En yakın ödül için {rules[0].points_required - c.total_points} puan daha gerekli
                          </span>
                        )}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-eco-gray uppercase tracking-wide mb-3">
                          Verilebilecek Hediyeler
                        </p>
                        {eligibleRewards.map((r: any) => {
                          const key = `${c.id}-${r.id}`;
                          const isGiving = giving === key;
                          return (
                            <div key={r.id} className="flex items-center justify-between bg-white rounded-lg border border-eco-border p-3">
                              <div className="flex items-center gap-2">
                                <Gift className="w-4 h-4 text-eco-green" />
                                <div>
                                  <p className="font-semibold text-eco-text text-sm">{r.reward_name}</p>
                                  <p className="text-xs text-eco-gray">{r.points_required} puan karşılığı</p>
                                </div>
                              </div>
                              <button
                                onClick={() => giveReward(c.id, r.id)}
                                disabled={isGiving}
                                className="eco-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-60"
                              >
                                {isGiving ? (
                                  <>
                                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    İşleniyor...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Hediye Verildi
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
