'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Suspense, useEffect } from 'react';

function PuanLoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role === 'CUSTOMER') router.replace('/musteri');
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      phone,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Telefon numarası veya şifre hatalı.');
      setLoading(false);
      return;
    }

    // Rol kontrolü — müşteri değilse uyar
    const res = await fetch('/api/auth/session');
    const sess = await res.json();
    const role = sess?.user?.role;

    if (role !== 'CUSTOMER') {
      setError('Bu panel yalnızca müşterilere özeldir. Çalışan girişi için CRM sayfasını kullanın.');
      setLoading(false);
      return;
    }

    router.push('/musteri');
    router.refresh();
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-eco-bg flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-eco-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eco-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-eco-green rounded-2xl mb-4 shadow-lg">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-eco-text">Ecobor Puan Paneli</h1>
          <p className="text-eco-text-2 text-sm mt-1">Puan bakiyenizi ve ödüllerinizi görüntüleyin</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-eco-border shadow-sm p-8">
          <h2 className="text-lg font-semibold text-eco-text mb-6">Giriş Yap</h2>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-eco-error rounded-lg p-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-eco-text mb-1.5">Telefon Numarası</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-gray" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="eco-input pl-9 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-eco-text mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eco-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="eco-input pl-9 pr-9 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-eco-gray hover:text-eco-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full eco-btn-primary justify-center py-3 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : 'Giriş Yap'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-eco-gray mt-5">
          © 2026 Ecobor Tarım — Tüm hakları saklıdır
        </p>
      </div>
    </div>
  );
}

export default function PuanPage() {
  return (
    <Suspense>
      <PuanLoginForm />
    </Suspense>
  );
}
