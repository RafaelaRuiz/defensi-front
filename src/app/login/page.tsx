"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUser, setRememberUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular autenticación (aquí integrarías con tu API)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red
      
      // Simular respuesta exitosa
      const userData = {
        id: "1",
        username: username,
        email: `${username}@defensi.com`
      };

      login(userData);
      router.push("/dashboard");
    } catch (error) {
      alert("Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <Image src="/images/defensi_logo.png" alt="Logo" width={100} height={100} />
          
          {/* Título llamativo */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Single Sign In</h1>
            <p className="text-gray-600 text-sm">Accede a tu cuenta de forma segura</p>
          </div>

          {/* Formulario */}
          <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            {/* Campo Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {/* Checkbox Recordar Usuario */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberUser"
                checked={rememberUser}
                onChange={(e) => setRememberUser(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberUser" className="ml-2 block text-sm text-gray-700">
                Recordar usuario
              </label>
            </div>

            {/* Botón Ingresar */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium"
              text={isLoading ? "Ingresando..." : "Ingresar"}
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
            />
          </form>

          {/* Enlaces adicionales */}
          <div className="flex flex-col items-center space-y-2 w-full">
            <button className="text-blue-500 hover:text-blue-700 text-sm">
              ¿Olvidaste tu contraseña?
            </button>
            <button 
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
