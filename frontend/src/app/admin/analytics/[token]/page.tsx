"use client";
import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Eye } from 'lucide-react';
import Link from 'next/link';

type Log = {
  id: string;
  type: 'OPEN' | 'STAY' | 'COMPLETE';
  timestamp: string;
  slideIndex?: number;
  duration?: number;
  userAgent?: string;
};

type PresentationData = {
  presentation: {
    title: string;
    googleSlidesUrl: string;
  };
  logs: Log[];
};

export default function AnalyticsPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<PresentationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/stats/${token}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8 text-center">Carregando dados...</div>;
  if (!data || !data.presentation) return <div className="p-8 text-center text-red-500">Apresentação não encontrada.</div>;

  // Aggregation Logic
  const totalViews = data.logs.filter(l => l.type === 'OPEN').length;
  const completions = data.logs.filter(l => l.type === 'COMPLETE').length;

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  };

  // Calculate total time and first access per slide
  const slideStats: Record<number, { duration: number; firstAccess: string | null }> = {};
  data.logs.filter(l => l.type === 'STAY').forEach(log => {
    if (log.slideIndex !== undefined && log.slideIndex !== null) {
      if (!slideStats[log.slideIndex]) {
        slideStats[log.slideIndex] = { duration: 0, firstAccess: log.timestamp };
      }

      slideStats[log.slideIndex].duration += log.duration || 0;

      // Keep earliest timestamp
      if (new Date(log.timestamp) < new Date(slideStats[log.slideIndex].firstAccess!)) {
        slideStats[log.slideIndex].firstAccess = log.timestamp;
      }
    }
  });

  return (
    <div>
      <Link href="/admin/presentations" className="flex items-center gap-2 text-brand-gray mb-6 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Voltar para Apresentações
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{data.presentation.title}</h1>
        <div className="flex gap-2">
          <span className="bg-brand-neon/20 text-brand-neon px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Token: {token}</span>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-brand-darkgray p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><Eye size={20} /></div>
            <span className="text-brand-gray font-medium">Visualizações</span>
          </div>
          <p className="text-4xl font-bold text-white">{totalViews}</p>
        </div>
        <div className="bg-brand-darkgray p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-500"><Clock size={20} /></div>
            <span className="text-brand-gray font-medium">Conclusões</span>
          </div>
          <p className="text-4xl font-bold text-white">{completions}</p>
        </div>
      </div>

      {/* Slide Engagement */}
      <h3 className="text-xl font-bold mb-6 text-white">Engajamento por Slide</h3>
      <div className="bg-brand-darkgray rounded-2xl border border-white/5 overflow-hidden p-6">
        {Object.keys(slideStats).length === 0 ? (
          <p className="text-brand-gray text-center">Nenhum dado de slides coletado ainda.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(slideStats).sort(([a], [b]) => Number(a) - Number(b)).map(([slide, stats]) => (
              <div key={slide} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-gray uppercase tracking-widest">Slide {slide}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-brand-gray">Primeiro acesso: {new Date(stats.firstAccess!).toLocaleString()}</span>
                    <span className="text-sm text-white font-mono bg-black/30 px-2 py-1 rounded">{formatDuration(stats.duration)}</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-black rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-neon shadow-[0_0_10px_rgba(180,255,0,0.5)]"
                    style={{ width: `${Math.min((stats.duration / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Logs Table */}
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-6 text-white">Logs Recentes</h3>
        <div className="bg-brand-darkgray rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-brand-gray uppercase">
              <tr>
                <th className="p-4">Evento</th>
                <th className="p-4">Tempo</th>
                <th className="p-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.logs.slice().reverse().slice(0, 10).map(log => (
                <tr key={log.id} className="hover:bg-white/5">
                  <td className="p-4 font-bold text-white max-w-[50px]">{log.type}</td>
                  <td className="p-4 text-brand-gray">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-brand-gray">
                    {log.type === 'STAY' && `Slide ${log.slideIndex} (${formatDuration(log.duration || 0)})`}
                    {log.type === 'OPEN' && log.userAgent?.substring(0, 50) + '...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
