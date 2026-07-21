'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormData } from '@/lib/schemas';

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg('Usuario o contraseña incorrectos.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-red to-red-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg">
          CS
        </div>
        <h1 className="text-3xl font-black text-white">Iniciar Sesión</h1>
        <p className="text-gray-400 text-sm">Accede a tu cuenta en Cryzan Sport</p>
      </div>

      <div className="bg-brand-card p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="admin@cryzan.com"
                className="w-full bg-gray-900 border border-gray-700 pl-10 pr-4 py-3 rounded-xl text-white text-sm focus:border-brand-red outline-none"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-700 pl-10 pr-4 py-3 rounded-xl text-white text-sm focus:border-brand-red outline-none"
              />
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red hover:bg-brand-redHover text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-800 text-xs text-gray-400 space-y-2">
          <p className="font-semibold text-white">Credenciales de Prueba Sembradas:</p>
          <p>
            <strong className="text-brand-red">Admin:</strong> admin@cryzan.com / 123456
          </p>
          <p>
            <strong className="text-brand-red">Cliente:</strong> cliente@cryzan.com / 123456
          </p>
        </div>
      </div>
    </div>
  );
}
