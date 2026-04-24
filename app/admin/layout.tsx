import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationBell from '@/components/shared/NotificationBell';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/giris');

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-eco-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-eco-green flex items-center justify-center text-white text-xs font-bold">
                {session.user?.name?.[0] ?? 'A'}
              </div>
              <span className="text-sm font-medium text-eco-text hidden sm:block">{session.user?.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 bg-eco-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
