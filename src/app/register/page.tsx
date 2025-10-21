"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) return alert("Completa todos los campos");
    setIsLoading(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const res = await fetch(`${api}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error registrando");
      setOtpSent(true);
      alert("Registro iniciado. Revisa tu correo para el código OTP");
    } catch (err: any) {
      alert(err.message || "Error al registrar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) return alert("Ingresa el código OTP");
    setIsLoading(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${api}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error verificando OTP");
      login(json.user, json.token);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Error verificando OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              Crear cuenta
            </h1>
            <p className="text-gray-600 text-sm">
              Regístrate con email y contraseña. Recibirás un OTP para
              confirmar.
            </p>
          </div>

          <form
            className="w-full space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
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

            {!otpSent ? (
              <Button
                onClick={handleRegister}
                text={isLoading ? "Registrando..." : "Crear cuenta"}
                className="w-full"
              />
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                    placeholder="123456"
                  />
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  text={isLoading ? "Verificando..." : "Verificar código"}
                  className="w-full"
                />
              </div>
            )}
          </form>

          <div className="flex flex-col items-center space-y-2 w-full">
            <a
              href="/login"
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Ir a inicio de sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
