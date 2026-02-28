// app/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({
    user: null,
    authloading: true,
    hasCredentials: false,
    logout: async () => {},
    checkAuth: async () => { return false; } // Útil para re-validar tras login
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [authloading, setAuthloading] = useState(true);
  const [hasCredentials , sethasCredentials] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const publicRoutes = ['/login', '/signup', '/', '/play', '/launch', '/canvas'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const checkAuth = useCallback(async () => {
  setAuthloading(true);

  try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

      if (!csrfToken) {
        setUser(null);
        return false;
      }

      const res = await fetch('/api/profile/me', {
        credentials: 'include',
        headers: { 'x-csrf-token': csrfToken || '' },
      });

      if (res.status === 401 || !res.ok) {
        setUser(null);
        return false;
      }

      const userData = await res.json();
      setUser(userData);
      return true;
    } catch {
      setUser(null);
      return false;
    } finally {
      setAuthloading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const loggedIn = await checkAuth();

      const isPublicRoute = publicRoutes.includes(pathname);

      if (loggedIn && isPublicRoute) {
        router.replace('/me');
      } else if (!loggedIn && !isPublicRoute) {
        router.replace('/login');
      }
    })();
  }, [pathname, router, checkAuth]);

  const logout = async () => {
    try {
		const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

      // 1. Obtener el CSRF token de las cookies (document.cookie)
      // Tu backend Fastify lo guarda en una cookie no httpOnly llamada 'csrf_token'
    
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-csrf-token': csrfToken || '', // Requerido por tu middleware preHandler
        },
        // body: JSON.stringify({ user: { id: user.id }}),
      });
    } catch (err) {
        console.error("Error durante el logout:", err);
        return;
    } finally {
      // 2. Limpiar el estado local e ir a home pase lo que pase
      setUser(null);
      router.push('/login');
      router.refresh(); // Limpia la caché de Next.js
    }
  };

  return (
    <AuthContext.Provider value={{ user, authloading, hasCredentials, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
