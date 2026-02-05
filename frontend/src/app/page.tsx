"use client";
import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('ploomes_auth_token'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-brand-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-brand-black to-brand-black z-0 pointer-events-none opacity-50" />

      <div className="z-10 text-center space-y-12 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-neon/10 border border-brand-neon/20 text-brand-neon text-sm font-bold tracking-widest uppercase">
          <Zap size={14} />
          Plataforma de Rastreamento Real-time
        </div>

        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white">
          A9 <span className="text-brand-neon drop-shadow-[0_0_20px_rgba(26,255,0,0.5)]">Tracker</span>
        </h1>

        <p className="text-brand-gray text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
          Transforme suas apresentações em dados acionáveis. Integre engajamento real diretamente ao seu CRM.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {isLoggedIn ? (
            <Link href="/admin" className="group flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-neon text-black font-black text-xl hover:shadow-glow transition-all active:scale-95">
              Acessar Dashboard
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link href="/login" className="group flex items-center gap-3 px-10 py-5 rounded-2xl bg-brand-neon text-black font-black text-xl hover:shadow-glow transition-all active:scale-95">
              Começar Agora
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <Link href="/pub/preview" className="px-10 py-5 rounded-2xl border border-white/10 text-white hover:bg-white/5 transition-all font-bold text-xl">
            Ver Demo Pública
          </Link>
        </div>

        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-white/5">
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg">Tempo Real</h3>
            <p className="text-brand-gray text-sm">Saiba exatamente quando e como suas propostas são visualizadas.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg">Foco no Engajamento</h3>
            <p className="text-brand-gray text-sm">Descubra em quais slides seu cliente passa mais tempo.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg">Sync Automático</h3>
            <p className="text-brand-gray text-sm">Feedback instantâneo no card do negócio no Ploomes CRM.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
