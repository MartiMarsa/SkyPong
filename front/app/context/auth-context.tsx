// app/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  loading: true,
  logout: async () => {},
  checkAuth: async () => { return false; } // Útil para re-validar tras login
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCredentials , sethasCredentials] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/verify', { 
        credentials: 'include' 
      });
      console.log("Response:", res)
      if (res.ok) {
        const data = await res.json();
        console.log("Auth data verified: ", data);
        setUser(data);
        return(true);
      } else {
          setUser(null);
          console.warn("Auth data NOT verified");
         return(false);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      // 1. Obtener el CSRF token de las cookies (document.cookie)
      // Tu backend Fastify lo guarda en una cookie no httpOnly llamada 'csrf_token'
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-csrf-token': csrfToken || '', // Requerido por tu middleware preHandler
        }
      });
    } catch (err) {
      console.error("Error durante el logout:", err);
    } finally {
      // 2. Limpiar el estado local e ir a home pase lo que pase
      setUser(null);
      router.push('/');
      router.refresh(); // Limpia la caché de Next.js
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasCredentials, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);