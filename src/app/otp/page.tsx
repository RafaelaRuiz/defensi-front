"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Button from "@/components/ui/button";
import Alert from "@/components/ui/alert";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted data is exactly 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Ingresa el código completo de 6 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const res = await fetch(`${api}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Código OTP inválido");

      // Login successful
      login(json.user, json.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error verificando OTP");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const res = await fetch(`${api}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Error al reenviar código");

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setError("");
    } catch (err: any) {
      setError(err.message || "Error al reenviar OTP");
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
              Verificación OTP
            </h1>
            <p className="text-gray-600 text-sm">
              Ingresa el código de 6 dígitos enviado a
            </p>
            <p className="text-gray-800 text-sm font-semibold mt-1">{email}</p>
          </div>

          {error && (
            <Alert message={error} type="error" onClose={() => setError("")} />
          )}

          <div className="flex justify-center gap-2 w-full">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-gray-900"
                disabled={isLoading}
              />
            ))}
          </div>

          <Button
            onClick={handleVerifyOtp}
            text={isLoading ? "Verificando..." : "Verificar código"}
            className="w-full"
            disabled={isLoading || otp.some((d) => !d)}
          />

          <div className="flex flex-col items-center space-y-2 w-full">
            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-blue-500 hover:text-blue-700 text-sm disabled:opacity-50"
            >
              Reenviar código
            </button>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <OtpContent />
    </Suspense>
  );
}
