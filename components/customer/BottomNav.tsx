'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Gift, User, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/musteri', label: 'Puanlarım', icon: Home, exact: true },
  { href: '/musteri/gecmis', label: 'Geçmiş', icon: History },
  { href: '/musteri/kargo', label: 'Kargo', icon: Truck },
  { href: '/musteri/oduller', label: 'Ödüller', icon: Gift },
  { href: '/musteri/profil', label: 'Profilim', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-eco-border z-40 pb-safe">
      <div className="flex">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
                active ? 'text-eco-green' : 'text-eco-gray hover:text-eco-text')}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
