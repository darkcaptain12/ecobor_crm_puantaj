'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = '/giris' }: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !allowedRoles.includes((session.user as any)?.role)) {
      router.push(redirectTo);
    }
  }, [session, status, allowedRoles, redirectTo, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-eco-green border-t-transparent" />
      </div>
    );
  }

  if (!session || !allowedRoles.includes((session.user as any)?.role)) return null;

  return <>{children}</>;
}
