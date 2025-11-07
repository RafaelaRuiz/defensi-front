"use client";

import { useEffect, useState } from "react";

interface AlertProps {
  message: string;
  type?: "error" | "success" | "warning";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Alert({
  message,
  type = "error",
  onClose,
  autoClose = true,
  duration = 5000,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isShaking, setIsShaking] = useState(true);

  useEffect(() => {
    // Activar animación de sacudida
    setIsShaking(true);
    const shakeTimer = setTimeout(() => setIsShaking(false), 500);

    // Auto cerrar si está habilitado
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => {
        clearTimeout(timer);
        clearTimeout(shakeTimer);
      };
    }

    return () => clearTimeout(shakeTimer);
  }, [message, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    error: {
      border: "border-red-500",
      bg: "bg-red-50",
      text: "text-red-800",
      icon: "❌",
    },
    success: {
      border: "border-green-500",
      bg: "bg-green-50",
      text: "text-green-800",
      icon: "✅",
    },
    warning: {
      border: "border-yellow-500",
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      icon: "⚠️",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.border} ${style.bg} border-2 rounded-lg p-4 mb-4 ${
        isShaking ? "animate-shake" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{style.icon}</span>
          <p className={`${style.text} font-medium text-sm`}>{message}</p>
        </div>
        {!autoClose && onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className={`${style.text} hover:opacity-70 transition-opacity`}
          >
            <svg
              className="w-5 h-5"
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
        )}
      </div>
    </div>
  );
}
