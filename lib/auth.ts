import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { supabaseServer } from './supabase-server';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
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
        const { data: user } = await supabaseServer
          .from('users')
          .select('id, name, phone, password, role')
          .eq('phone', credentials.phone)
          .maybeSingle();
        if (!user) return null;
        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.phone, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};
