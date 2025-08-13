"use client";

import Image from "next/image";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation"; 

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login'); // Redirigir a la página de login
  };

  const handleRegister = () => {
    router.push('/register'); // Redirigir a la página de registro
  };

  return(
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center space-y-6">
          <Image src="/images/defensi_logo.png" alt="Logo" width={120} height={120} />

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
  )
}
