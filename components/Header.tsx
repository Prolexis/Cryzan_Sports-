'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, ShieldAlert } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { ThemeToggle } from './ThemeToggle';
import { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-brand-dark text-white border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO REBRAND: Cryzan Sport */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-red to-red-700 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition">
            CS
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider text-white">CRY ZAN</span>
            <span className="text-xs font-semibold text-brand-red tracking-widest uppercase">SPORT PERÚ</span>
          </div>
        </Link>

        {/* NAVEGACIÓN */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={`transition ${
              pathname === '/' ? 'text-brand-red font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/productos"
            className={`transition ${
              pathname?.startsWith('/productos') ? 'text-brand-red font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            Productos
          </Link>
          <Link
            href="/contacto"
            className={`transition ${
              pathname === '/contacto' ? 'text-brand-red font-bold' : 'text-gray-300 hover:text-white'
            }`}
          >
            Contacto
          </Link>
          {(session?.user as any)?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-semibold px-2 py-1 rounded bg-yellow-400/10 border border-yellow-400/30"
            >
              <ShieldAlert className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>

        {/* BOTONES DERECHA */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* CARRITO BADGE */}
          <Link
            href="/carrito"
            className="relative p-2 text-gray-300 hover:text-white transition"
            title="Ver Carrito de Compras"
          >
            <ShoppingCart className="w-6 h-6" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>

          {/* SESIÓN */}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-300 hidden sm:inline">
                Hola, <strong className="text-white">{session.user.name || session.user.email}</strong>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-1 bg-gray-800 hover:bg-brand-red text-white text-xs font-semibold px-3 py-2 rounded-lg transition border border-gray-700"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 bg-brand-red hover:bg-brand-redHover text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              <User className="w-4 h-4" /> Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
