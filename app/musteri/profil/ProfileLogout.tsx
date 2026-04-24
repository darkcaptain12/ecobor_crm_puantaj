'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function ProfileLogout() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/giris' })}
      className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-eco-error rounded-2xl font-medium hover:bg-eco-error hover:text-white transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Çıkış Yap
    </button>
  );
}
