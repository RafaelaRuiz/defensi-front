"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Notification from "@/components/ui/notification";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay un mensaje de logout
    const reason = sessionStorage.getItem("logoutReason");
    if (reason) {
      setLogoutMessage(reason);
      sessionStorage.removeItem("logoutReason");
    }

    // Redirigir al dashboard si está autenticado
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  // Mostrar loading mientras se valida la sesión
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {logoutMessage && (
        <Notification
          title="Sesión cerrada"
          message={logoutMessage}
          type="warning"
          onClose={() => setLogoutMessage(null)}
        />
      )}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="flex flex-col items-center space-y-6">
            <Image
              src="/images/defensi_logo.png"
              alt="Logo"
              width={120}
              height={120}
            />

            <Button
              className="bg-white !text-black border border-gray-300 hover:bg-gray-50 w-full py-3 rounded-md"
              text="Iniciar sesión"
              variant="outline"
              onClick={handleLogin}
            />

            <div className="flex flex-col items-center space-y-3 w-full">
              <button
                onClick={handleRegister}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
