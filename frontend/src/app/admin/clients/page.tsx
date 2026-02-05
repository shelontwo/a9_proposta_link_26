"use client";
import { useState, useEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';

type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', company: '', email: '' });
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/clients', {
        credentials: 'include'
      });
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch clients', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingClient
        ? `http://localhost:3001/api/clients/${editingClient.id}`
        : 'http://localhost:3001/api/clients';
      const method = editingClient ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ name: '', company: '', email: '' });
        setEditingClient(null);
        fetchClients();
      }
    } catch (error) {
      console.error('Failed to save client', error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ name: client.name, company: client.company, email: client.email });
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setFormData({ name: '', company: '', email: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Toda a história será preservada no banco, mas o cliente não aparecerá mais nas listagens.')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        fetchClients();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        alert(`Erro ao excluir cliente: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Failed to delete client', error);
      alert('Erro ao excluir cliente. Verifique sua conexão.');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Gestão de Clientes</h2>

      {/* Create/Edit Client Form */}
      <div className="bg-brand-darkgray p-6 rounded-2xl mb-12 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-neon">
            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          {editingClient && (
            <button onClick={handleCancelEdit} className="text-brand-gray hover:text-white flex items-center gap-1 text-sm">
              <X size={16} /> Cancelar Edição
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-neon"
            required
          />
          <input
            type="text"
            placeholder="Empresa"
            value={formData.company}
            onChange={e => setFormData({ ...formData, company: e.target.value })}
            className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-neon"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-neon"
            required
          />
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="bg-brand-neon text-black font-bold py-3 px-6 rounded-lg hover:shadow-glow transition-all">
              {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>

      {/* Client List */}
      <div className="bg-brand-darkgray rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/40 text-brand-gray text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Empresa</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-medium text-white">{client.name}</td>
                <td className="p-4 text-brand-gray">{client.company}</td>
                <td className="p-4 text-brand-gray">{client.email}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-brand-gray hover:text-brand-neon transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-brand-gray hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-brand-gray">Nenhum cliente cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
