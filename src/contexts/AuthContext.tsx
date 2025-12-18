"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username?: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token?: string) => void;
  logout: (reason?: string) => void;
  isLoading: boolean;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hora en milisegundos

  const logout = (reason?: string) => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("lastActivity");

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Mostrar notificación si hay una razón
    if (reason) {
      // Guardar la razón en sessionStorage para mostrarla después de la redirección
      sessionStorage.setItem("logoutReason", reason);

      // Redirigir a la página de inicio después de un pequeño delay
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
  };

  const resetInactivityTimer = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem("lastActivity", now.toString());

    // Limpiar el timer anterior
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Configurar nuevo timer
    if (user) {
      inactivityTimerRef.current = setTimeout(() => {
        logout("Tu sesión ha expirado por inactividad");
      }, INACTIVITY_LIMIT);
    }
  };

  const validateSession = async () => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    const lastActivity = localStorage.getItem("lastActivity");

    if (!savedUser || !savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(savedUser);

      // Verificar inactividad
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > INACTIVITY_LIMIT) {
          logout("Tu sesión ha expirado por inactividad");
          setIsLoading(false);
          return;
        }
      }

      // Verificar que el token sea válido con el backend
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const response = await fetch(`${api}/users/${userData.id}`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setUser(userData);
        resetInactivityTimer();
      } else {
        // Token inválido o expirado
        logout("Tu sesión ha expirado. Por favor, inicia sesión nuevamente");
      }
    } catch (error) {
      console.error("Error validating session:", error);
      logout("Error al validar la sesión. Por favor, inicia sesión nuevamente");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateSession();

    // Limpiar timer al desmontar
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Detectar actividad del usuario y asegurar que el timer esté activo
  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Iniciar el timer inmediatamente cuando el usuario está logueado
    resetInactivityTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("token", token);
    }
    // Guardar timestamp de última actividad
    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem("lastActivity", now.toString());

    // Iniciar timer después del login
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      logout("Tu sesión ha expirado por inactividad");
    }, INACTIVITY_LIMIT);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
