import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/giris');
  }

  const role = (session.user as any).role;
  if (role === 'ADMIN') redirect('/admin');
  if (role === 'MANAGER') redirect('/mudur');
  if (role === 'ENGINEER') redirect('/dashboard');
  if (role === 'REMOTE_AGENT') redirect('/saha');
  if (role === 'CUSTOMER') redirect('/musteri');

  redirect('/giris');
}
