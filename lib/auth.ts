import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function mergeCarts(sessionId: string, userId: string) {
  try {
    const guestCart = await prisma.cart.findFirst({
      where: { sessionId, status: 'ACTIVE' },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { items: true },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId, status: 'ACTIVE' },
        include: { items: true },
      });
    }

    for (const guestItem of guestCart.items) {
      const existingUserItem = userCart.items.find(
        (ui) => ui.productVariantId === guestItem.productVariantId
      );

      if (existingUserItem) {
        await prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: {
            quantity: existingUserItem.quantity + guestItem.quantity,
            priceSnapshot: guestItem.priceSnapshot,
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productVariantId: guestItem.productVariantId,
            quantity: guestItem.quantity,
            priceSnapshot: guestItem.priceSnapshot,
          },
        });
      }
    }

    await prisma.cart.delete({
      where: { id: guestCart.id },
    });
  } catch (error) {
    console.error('Error merging carts on login:', error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Ingrese correo y contraseña');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Usuario o contraseña incorrectos');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('Usuario o contraseña incorrectos');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;

        try {
          const cookieStore = cookies();
          const sessionId = cookieStore.get('sessionId')?.value;
          if (sessionId) {
            await mergeCarts(sessionId, user.id);
          }
        } catch (e) {
          console.error('Failed to read cookies or merge carts in JWT callback:', e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'cryzan_sport_secret_key_2026_super_secure',
};
