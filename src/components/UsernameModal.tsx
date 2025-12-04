"use client";

import { useState } from "react";
import Button from "@/components/ui/button";

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (username: string) => Promise<void>;
  suggestedUsername: string;
}

const UsernameModal: React.FC<UsernameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suggestedUsername,
}) => {
  const [username, setUsername] = useState("");
  const [useEmailUsername, setUseEmailUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    // Validar que se haya elegido una opción
    if (!username.trim() && !useEmailUsername) {
      setError(
        "Debes ingresar un nombre de usuario o aceptar usar el sugerido"
      );
      return;
    }

    // Validar que no se hayan elegido ambas opciones
    if (username.trim() && useEmailUsername) {
      setError(
        "Elige solo una opción: ingresar un username o usar el sugerido"
      );
      return;
    }

    // Validar longitud mínima si se ingresó manualmente
    if (username.trim() && username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const finalUsername = useEmailUsername ? suggestedUsername : username;
      await onSave(finalUsername);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el nombre de usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Configura tu perfil
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Por favor, elige un nombre de usuario para personalizar tu
            experiencia
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (e.target.value) {
                  setUseEmailUsername(false);
                }
                setError("");
              }}
              placeholder="Tu nombre de usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading || useEmailUsername}
              maxLength={50}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 3 caracteres, máximo 50
            </p>
          </div>

          {/* Checkbox para usar username sugerido */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useEmailUsername}
                onChange={(e) => {
                  setUseEmailUsername(e.target.checked);
                  if (e.target.checked) {
                    setUsername("");
                  }
                  setError("");
                }}
                disabled={isLoading}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-700">
                ¿Estás de acuerdo con dejar tu username como{" "}
                <span className="font-semibold text-blue-600">
                  {suggestedUsername}
                </span>
                ?
              </span>
            </label>
          </div>

          <div className="flex space-x-3">
            <Button
              text={isLoading ? "Guardando..." : "Guardar"}
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
