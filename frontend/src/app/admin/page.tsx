"use client";
import { useState, useEffect } from 'react';
import { Users, Presentation, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    presentations: 0,
    views: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://localhost:3001/api/stats/summary', {
          credentials: 'include'
        });
        const data = await res.json();

        setStats({
          clients: data.clients || 0,
          presentations: data.presentations || 0,
          views: data.views || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const cards = [
    { label: 'Total de Clientes', value: stats.clients, icon: Users, color: 'text-blue-400' },
    { label: 'Apresentações', value: stats.presentations, icon: Presentation, color: 'text-brand-neon' },
    { label: 'Visualizações Totais', value: stats.views, icon: ArrowRight, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">Dashboard</h2>
        <p className="text-brand-gray mt-2 text-lg">Bem-vindo ao centro de controle da sua operação.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-8 rounded-3xl bg-brand-darkgray border border-white/5 relative overflow-hidden group hover:border-brand-neon/30 transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
              </div>
              <p className="text-brand-gray text-xs uppercase tracking-widest font-bold">{card.label}</p>
              <div className="flex items-end justify-between mt-4">
                <p className={`text-5xl font-black ${card.color}`}>
                  {!isMounted || isLoading ? '--' : (card.value ?? 0)}
                </p>
                <Icon className={card.color} size={32} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-brand-darkgray/40 border border-white/5 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="text-brand-neon" size={24} />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/clients" className="flex flex-col p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-brand-neon transition-all group">
              <Users className="text-brand-gray group-hover:text-brand-neon mb-4 transition-colors" />
              <span className="font-bold">Novo Cliente</span>
              <span className="text-xs text-brand-gray mt-1">Cadastre empresas e contatos</span>
            </Link>
            <Link href="/admin/presentations" className="flex flex-col p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-brand-neon transition-all group">
              <Presentation className="text-brand-gray group-hover:text-brand-neon mb-4 transition-colors" />
              <span className="font-bold">Nova Apresentação</span>
              <span className="text-xs text-brand-gray mt-1">Gere links de rastreamento</span>
            </Link>
          </div>
        </section>

        <section className="bg-brand-darkgray/40 border border-white/5 p-8 rounded-3xl flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-brand-neon/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-brand-neon" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Ambiente Seguro</h3>
          <p className="text-brand-gray text-sm max-w-xs">
            Todos os seus dados de rastreamento e integrações estão protegidos nesta área administrativa.
          </p>
        </section>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
