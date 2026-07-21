import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Cryzan Sport | Tienda Deportiva en Trujillo Perú',
  description: 'Descubre ropa, zapatillas, pelotas y casacas deportivas de alta calidad al mejor precio en Cryzan Sport.',
  openGraph: {
    title: 'Cryzan Sport - Vive el Deporte',
    description: 'Productos deportivos originales y duraderos con envíos rápidos a todo el Perú.',
    images: ['/img/productos/polo.jpeg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen flex flex-col bg-brand-dark text-white antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
