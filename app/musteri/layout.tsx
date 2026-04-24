import BottomNav from '@/components/customer/BottomNav';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MusteriLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'CUSTOMER') redirect('/puan');

  return (
    <div className="min-h-screen bg-eco-bg pb-20">
      <div className="max-w-md mx-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
