"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import Notification from "@/components/ui/notification";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const handleRequestOtp = async () => {
    if (!email || !password) {
      setError("Por favor completa email y contraseña");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const res = await fetch(`${api}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Credenciales inválidas");

      // Show notification and redirect to OTP page
      setShowNotification(true);
      setTimeout(() => {
        router.push(`/otp?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al solicitar OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showNotification && (
        <Notification
          title="Código OTP enviado"
          message="Se ha enviado un código a tu email para confirmar."
          type="success"
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center space-y-6">
          <Image
            src="/images/defensi_logo.png"
            alt="Logo"
            width={100}
            height={100}
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Accede a tu cuenta
            </h1>
            <p className="text-gray-600 text-sm">
              Ingresa con tu email y contraseña. Recibirás un OTP para
              confirmar.
            </p>
          </div>

          <form
            className="w-full space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            {error && (
              <Alert
                message={error}
                type="error"
                onClose={() => setError("")}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="tu@correo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Tu contraseña"
                required
              />
            </div>

            <Button
              onClick={handleRequestOtp}
              text={isLoading ? "Enviando..." : "Iniciar sesión"}
              className="w-full"
            />
          </form>

          <div className="flex flex-col items-center space-y-2 w-full">
            <a
              href="/register"
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
