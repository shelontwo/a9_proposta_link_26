"use client";
import { useState, useEffect } from 'react';
import { Edit2, Trash2, X, ShieldCheck } from 'lucide-react';

type User = {
  id: string;
  username: string;
  password?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('https://api-a9-tracker.f7g8uz.easypanel.host/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser
        ? `https://api-a9-tracker.f7g8uz.easypanel.host/api/users/${editingUser.id}`
        : 'https://api-a9-tracker.f7g8uz.easypanel.host/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ username: '', password: '' });
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to save user', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: user.password || '' });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const res = await fetch(`https://api-a9-tracker.f7g8uz.easypanel.host/api/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Gestão de Usuários</h2>

      {/* Create/Edit User Form */}
      <div className="bg-brand-darkgray p-6 rounded-2xl mb-12 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-brand-neon">
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          {editingUser && (
            <button onClick={handleCancelEdit} className="text-brand-gray hover:text-white flex items-center gap-1 text-sm">
              <X size={16} /> Cancelar Edição
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-neon transition-all"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-neon transition-all"
            required
          />
          <button
            type="submit"
            className="bg-brand-neon text-black font-extrabold py-3 rounded-xl hover:shadow-glow transition-all active:scale-95"
          >
            {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 bg-brand-darkgray rounded-2xl border border-white/5">
            <p className="text-brand-gray">Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-brand-darkgray p-4 rounded-xl border border-white/5 flex items-center justify-between hover:border-brand-neon/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-neon/10 rounded-lg flex items-center justify-center group-hover:bg-brand-neon/20 transition-colors">
                  <ShieldCheck className="text-brand-neon" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{user.username}</h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 text-brand-gray hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
