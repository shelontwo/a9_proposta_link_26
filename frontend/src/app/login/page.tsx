"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// 1. Criamos um subcomponente para a lógica que usa searchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/user`, { credentials: 'include' });
        const data = await res.json();
        if (data.authenticated) {
          router.push('/admin');
          return;
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
      setIsLoading(false);
    };

    checkAuth();

    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setError('Falha na autenticação. Apenas emails @a9p.com.br são permitidos.');
    }
  }, [router, searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-brand-black">
        <div className="animate-pulse text-brand-neon text-xl">Verificando autenticação...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-brand-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-brand-black to-brand-black z-0 pointer-events-none opacity-50" />
      <div className="z-10 w-full max-w-md bg-brand-darkgray p-8 rounded-3xl border border-white/10 shadow-glow relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-brand-black border-4 border-brand-neon rounded-full flex items-center justify-center shadow-glow">
          <span className="text-3xl font-bold text-brand-neon">A9</span>
        </div>
        <div className="mt-8 text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo</h1>
          <p className="text-brand-gray">Faça login para acessar o painel</p>
        </div>
        {error && (
          <div className="mb-6 text-red-400 text-sm text-center font-medium bg-red-400/10 py-3 px-4 rounded-lg border border-red-400/20">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <button onClick={handleGoogleLogin} className="w-full bg-white text-gray-800 font-bold py-4 px-6 rounded-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>
    </main>
  );
}

// 2. O export default envolve tudo em um Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-brand-black min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}