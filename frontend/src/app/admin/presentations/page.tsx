"use client";
import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Play, Edit2, Trash2, X, CheckCircle2, Eye } from 'lucide-react';
import Link from 'next/link';

type Client = {
  id: string;
  name: string;
  company: string;
};

type Presentation = {
  id: string;
  title: string;
  clientId: string;
  token: string;
  pdfUrl: string;
  ploomesDealId?: string;
  createdAt: string;
  isCompleted?: boolean;
  completedAt?: string;
  lastPageViewTime?: number;
};

export default function PresentationsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [formData, setFormData] = useState({ title: '', clientId: '', pdfUrl: '', ploomesDealId: '' });
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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

  const fetchData = async () => {
    try {
      const [clientsRes, presRes] = await Promise.all([
        fetch('http://localhost:3001/api/clients', { credentials: 'include' }),
        fetch('http://localhost:3001/api/presentations', { credentials: 'include' })
      ]);
      const clientsData = await clientsRes.json();
      const presData = await presRes.json();
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setPresentations(Array.isArray(presData) ? presData : []);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setClients([]);
      setPresentations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPresentation
        ? `http://localhost:3001/api/presentations/${editingPresentation.id}`
        : 'http://localhost:3001/api/presentations';
      const method = editingPresentation ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ title: '', clientId: '', pdfUrl: '', ploomesDealId: '' });
        setEditingPresentation(null);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save presentation', error);
    }
  };

  const handleEdit = (pres: Presentation) => {
    setEditingPresentation(pres);
    setFormData({
      title: pres.title,
      clientId: pres.clientId,
      pdfUrl: pres.pdfUrl,
      ploomesDealId: pres.ploomesDealId || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingPresentation(null);
    setFormData({ title: '', clientId: '', pdfUrl: '', ploomesDealId: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta apresentação? Os dados de rastreamento serão mantidos para histórico, mas o link deixará de funcionar.')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/presentations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        alert(`Erro ao excluir apresentação: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Failed to delete presentation', error);
      alert('Erro ao excluir apresentação. Verifique sua conexão.');
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown';
  const getPublicLink = (token: string) => `${window.location.origin}/pub/${token}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado!');
  };

  // Helper for hydration-safe date display
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const formatDate = (dateStr: string) => {
    if (!isMounted) return '--/--/----';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDateTime = (dateStr: string) => {
    if (!isMounted) return '--/--/---- --:--';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Gestão de Apresentações</h2>

      {/* Create/Edit Presentation Form */}
      <div className="bg-brand-darkgray p-6 rounded-2xl mb-12 border border-white/10 text-brand-offwhite">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-neon">
            {editingPresentation ? 'Editar Apresentação' : 'Nova Apresentação'}
          </h3>
          {editingPresentation && (
            <button onClick={handleCancelEdit} className="text-brand-gray hover:text-white flex items-center gap-1 text-sm transition-colors">
              <X size={16} /> Cancelar Edição
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase text-brand-gray mb-1">Título</label>
            <input
              type="text"
              placeholder="Ex: Proposta Comercial - Q1"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-neon"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase text-brand-gray mb-1 text-brand-offwhite font-medium">Cliente</label>
            <select
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-neon"
              required
            >
              <option value="">Selecione um cliente...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name} - {client.company}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase text-brand-gray mb-1">Link da apresentação (público)</label>
            <input
              type="url"
              placeholder="https://.../apresentacao.pdf"
              value={formData.pdfUrl}
              onChange={e => setFormData({ ...formData, pdfUrl: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-neon"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase text-brand-gray mb-1">ID do Negócio no Ploomes (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: 123456"
              value={formData.ploomesDealId}
              onChange={e => setFormData({ ...formData, ploomesDealId: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-neon"
            />
            <p className="text-xs text-brand-gray mt-1">Se preenchido, enviaremos atualizações para este negócio quando a apresentação for visualizada.</p>
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button type="submit" className="bg-brand-neon text-black font-bold py-3 px-6 rounded-lg hover:shadow-glow transition-all">
              {editingPresentation ? 'Salvar Alterações' : 'Gerar Link Público'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {presentations.map(pres => (
          <div key={pres.id} className="bg-brand-darkgray p-6 rounded-xl border border-white/5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 group hover:border-white/10 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-bold text-white">{pres.title}</h4>
                {pres.ploomesDealId && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                    Ploomes: {pres.ploomesDealId}
                  </span>
                )}
              </div>
              <p className="text-brand-gray text-sm">Cliente: <span className="text-white">{getClientName(pres.clientId)}</span></p>
              <div className="flex items-center gap-3 mt-2">
                <code className="bg-black px-2 py-1 rounded text-brand-neon text-xs">{pres.token}</code>
                <span className="text-xs text-brand-gray">{formatDate(pres.createdAt)}</span>

                {pres.isCompleted && (
                  <div
                    className="flex items-center bg-brand-neon/10 text-brand-neon px-3 py-1 rounded-full text-[10px] font-bold border border-brand-neon/20 animate-in fade-in zoom-in duration-500 shadow-[0_0_10px_rgba(180,255,0,0.1)] gap-1.5 whitespace-nowrap"
                    title={`Leu até a última página! Concluído em ${pres.completedAt ? formatDateTime(pres.completedAt) : '?'}`}
                  >
                    <CheckCircle2 size={12} className="shrink-0" />
                    <span>CONCLUÍDO</span>
                    <span className="text-white/40">-</span>
                    <span>{pres.completedAt ? formatDate(pres.completedAt) : ''}</span>
                    {pres.lastPageViewTime !== undefined && pres.lastPageViewTime !== null && (
                      <>
                        <span className="text-white/40">-</span>
                        <span className="bg-black/30 px-1.5 py-0.5 rounded text-white font-mono">
                          {formatDuration(pres.lastPageViewTime)}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyToClipboard(getPublicLink(pres.token))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium border border-white/5"
              >
                <Copy size={14} /> Link
              </button>
              <a
                href={getPublicLink(pres.token)}
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium border border-white/5"
              >
                <ExternalLink size={14} /> Testar
              </a>
              <Link
                href={`/admin/analytics/${pres.token}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-neon/10 text-brand-neon hover:bg-brand-neon/20 transition-colors text-xs font-medium border border-brand-neon/20"
              >
                <Eye size={14} /> Informações
              </Link>
              <div className="w-[1px] h-8 bg-white/5 mx-1 hidden sm:block" />
              <button
                onClick={() => handleEdit(pres)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-brand-neon transition-all text-xs font-medium border border-white/5"
              >
                <Edit2 size={14} /> Editar
              </button>
              <button
                onClick={() => handleDelete(pres.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-400/10 hover:text-red-400 transition-all text-xs font-medium border border-white/5"
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}
        {presentations.length === 0 && !isLoading && (
          <div className="p-12 text-center text-brand-gray border-2 border-dashed border-white/5 rounded-3xl">
            Nenhuma apresentação cadastrada ainda.
          </div>
        )}
      </div>
    </div>
  );
}
