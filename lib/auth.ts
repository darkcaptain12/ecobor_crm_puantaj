import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/giris' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'Telefon', type: 'tel' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const db = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: user } = await db
          .from('users')
          .select('id, name, phone, password, role, is_remote_enabled, remote_expire_at')
          .eq('phone', credentials.phone)
          .maybeSingle();

        if (!user) return null;
        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;

        // remote_expire_at kontrolü
        const isRemoteEnabled = user.is_remote_enabled && (
          !user.remote_expire_at || new Date(user.remote_expire_at) > new Date()
        );

        return {
          id: user.id,
          name: user.name,
          email: user.phone,
          role: user.role,
          is_remote_enabled: isRemoteEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as any).role = (user as any).role;
        (token as any).is_remote_enabled = (user as any).is_remote_enabled ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = (token as any).role;
        (session.user as any).is_remote_enabled = (token as any).is_remote_enabled ?? false;
      }
      return session;
    },
  },
};
