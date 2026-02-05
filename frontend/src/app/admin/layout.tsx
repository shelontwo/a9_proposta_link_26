"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, Users, Presentation, ShieldCheck, User } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api-a9-tracker.f7g8uz.easypanel.host/';

interface UserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/user`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Clientes', href: '/admin/clients', icon: Users },
    { label: 'Apresentações', href: '/admin/presentations', icon: Presentation },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-black text-white flex">
        {/* Sidebar */}
        <aside className="w-72 border-r border-white/5 bg-brand-darkgray/50 backdrop-blur-xl p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 bg-brand-neon rounded-xl flex items-center justify-center shadow-glow">
              <ShieldCheck className="text-black" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tighter">
              <img
                src="https://framerusercontent.com/images/PzCl0ZZKL1UcqxhMTTRf2szX0XU.svg?width=222&height=64"
                alt="A9 Logo"
                className="h-9 ml-3 w-auto"
              />
            </h1>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-brand-neon text-black font-bold shadow-glow'
                    : 'text-brand-gray hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon size={20} className={isActive ? 'text-black' : 'group-hover:text-brand-neon transition-colors'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            {/* User Profile */}
            {user && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-brand-gray font-bold mb-3">Usuário Logado</p>
                <div className="flex items-center gap-3">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-brand-neon/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-neon/20 border-2 border-brand-neon/30 flex items-center justify-center">
                      <User size={20} className="text-brand-neon" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-brand-gray truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-brand-gray font-bold mb-2">Status do Sistema</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-neon animate-pulse shadow-[0_0_8px_#1AFF00]"></div>
                <span className="text-sm font-medium text-white">Servidor Ativo</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-medium group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              Sair do Painel
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-neon/5 via-transparent to-transparent">
          <div className="p-8 max-w-7xl mx-auto">
            <style jsx global>{`
              #next-dev-overlay, 
              #nextjs-portal, 
              .nextjs-toast-errors-parent, 
              #__next-build-watcher,
              [data-nextjs-toast-errors-parent] {
                display: none !important;
              }
            `}</style>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
