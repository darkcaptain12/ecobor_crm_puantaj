'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Leaf, LayoutDashboard, Users, ShoppingBag, TrendingUp, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/shared/NotificationBell';

const navItems = [
  { href: '/saha', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/saha/musteriler', label: 'Müşterilerim', icon: Users },
  { href: '/saha/satis', label: 'Satış Yap', icon: ShoppingBag },
  { href: '/saha/komisyon', label: 'Komisyonlarım', icon: TrendingUp },
];

export default function SahaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 min-h-screen bg-eco-admin flex flex-col">
        <div className="p-5 border-b border-eco-admin-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-eco-green rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">ECOBOR</p>
              <p className="text-[10px] text-gray-400">Saha Temsilcisi</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={cn('sidebar-link', active && 'active')}>
                <item.icon className="w-4 h-4 flex-shrink-0" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-eco-admin-border">
          <button onClick={() => signOut({ callbackUrl: '/giris' })} className="sidebar-link w-full text-left">
            <LogOut className="w-4 h-4" />Çıkış Yap
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-eco-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-eco-green flex items-center justify-center text-white text-xs font-bold">
              {session?.user?.name?.[0] ?? 'S'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 bg-eco-bg">{children}</main>
      </div>
    </div>
  );
}
