'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Leaf, LayoutDashboard, Users, Calendar, ShoppingBag, Package, CheckSquare, LogOut, Menu, X, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/musteriler', label: 'Müşterilerim', icon: Users },
  { href: '/dashboard/takvim', label: 'Takvim & Takip', icon: Calendar },
  { href: '/dashboard/satis', label: 'Saha Satışı', icon: ShoppingBag },
  { href: '/dashboard/kargo', label: 'Kargo Takibi', icon: Truck },
  { href: '/dashboard/envanter', label: 'Araç Stoğum', icon: Package },
  { href: '/dashboard/gorevler', label: 'Görevlerim', icon: CheckSquare },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <div className="p-5 border-b border-eco-admin-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-eco-green rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">ECOBOR</p>
            <p className="text-[10px] text-gray-400">Mühendis Paneli</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onLinkClick}
              className={cn('sidebar-link', active && 'active')}>
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
    </>
  );
}

export default function EngineerSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-0 left-0 h-14 w-14 flex items-center justify-center z-40 text-eco-text"
        aria-label="Menüyü aç"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-eco-admin flex flex-col shadow-2xl">
            <div className="flex items-center justify-end p-3 border-b border-eco-admin-border">
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-eco-admin flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
