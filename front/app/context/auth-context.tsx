// app/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  avartarURL: "/avatars/default-avatar.png",
  loading: true,
  hasCredentials: false,
  logout: async () => {},
  checkAuth: async () => { return false; } // Útil para re-validar tras login
});
/*
const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
*/

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [authloading, setAuthloading] = useState(true);
  const [hasCredentials , sethasCredentials] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
      setAuthloading(true);
    try {
	const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];

        console.log("Checking auth credentials...");

		if (!csrfToken) return;
		
        console.log("Verifiying credentials...");
        const res = await fetch('/api/auth/verify', { 
            credentials: 'include', 
            headers: {
            'x-csrf-token': csrfToken || '', // Requerido por tu middleware preHandler
            },
        });
        console.log("Response:", res)
        if (res.status === 401) {
            setUser(null);
            return false;
        }
        if (res.ok) {
            const data = await res.json();
            console.log("Auth data verified: ", data);
        } else {
            setUser(null);
            console.warn("Auth data NOT verified");
        }

        const res2 = await fetch('/api/profile/me', { 
            credentials: 'include', 
            headers: {
            'x-csrf-token': csrfToken || '', // Requerido por tu middleware preHandler
            },
        });
        console.log("Response:", res2)
        if (res2.ok) {
            const data2 = await res2.json();
            console.log("Profile retieve: ", data2);
            setUser(data2);
            return(true);
        } else {
            setUser(null);
            console.warn("Profile info NOT found");
            return(false);
        }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthloading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
