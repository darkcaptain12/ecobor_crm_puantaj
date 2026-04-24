'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Leaf, LayoutDashboard, Users, ShoppingCart, Package,
  CheckSquare, Award, Bell, BarChart2, UserCog, LogOut, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/musteriler', label: 'Müşteriler', icon: Users },
  { href: '/admin/siparisler', label: 'Siparişler', icon: ShoppingCart },
  { href: '/admin/envanter', label: 'Envanter', icon: Package },
  { href: '/admin/gorevler', label: 'Görevler', icon: CheckSquare },
  { href: '/admin/komisyonlar', label: 'Komisyonlar', icon: TrendingUp },
  { href: '/admin/oduller', label: 'Ödül Kuralları', icon: Award },
  { href: '/admin/bildirimler', label: 'Bildirimler', icon: Bell },
  { href: '/admin/raporlar', label: 'Raporlar', icon: BarChart2 },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: UserCog },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-eco-admin flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-eco-admin-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-eco-green rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">ECOBOR</p>
            <p className="text-[10px] text-gray-400">Admin Paneli</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', active && 'active')}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-eco-admin-border">
        <button
          onClick={() => signOut({ callbackUrl: '/giris' })}
          className="sidebar-link w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
