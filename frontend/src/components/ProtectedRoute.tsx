"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api-a9-tracker.f7g8uz.easypanel.host/';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string | undefined;
  provider: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/user`, {
          credentials: 'include'
        });
        const data = await res.json();

        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          setUser(data.user);
          setIsLoading(false);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-neon border-r-transparent"></div>
          <p className="mt-4 text-brand-gray">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/user`, {
          credentials: 'include'
        });
        const data = await res.json();

        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, isLoading };
}
