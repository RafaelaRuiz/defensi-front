"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/button";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleTabClick = (tab: string, path: string) => {
    if (!isAuthenticated) {
      // Si no está autenticado, mostrar mensaje o redirigir al login
      alert("Debes iniciar sesión para acceder a esta sección");
      return;
    }
    setActiveTab(tab);
    router.push(path);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "🏠" },
    {
      id: "security",
      label: "ScanPhish",
      path: "https://defensi-vsphishing.vercel.app/phishing/urlDirecta",
      icon: "🛡️",
    },
    {
      id: "prodati",
      label: "Prodati",
      path: "http://40.117.196.165",
      icon: "📊",
    },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <img
              src="/images/defensi_logo.png"
              alt="Defensi Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-gray-800">Defensi</span>
          </div>

          {/* Tabs de navegación */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id, item.path)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                  flex items-center space-x-2
                  ${
                    isAuthenticated
                      ? activeTab === item.id
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      : "text-gray-400 cursor-not-allowed opacity-50"
                  }
                `}
                disabled={!isAuthenticated}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Menú de usuario */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <span className="text-gray-700">Hola, </span>
                  <span className="font-medium text-gray-900">
                    {user?.username || user?.email?.split("@")[0] || "Usuario"}
                  </span>
                </div>
                <Button
                  text="Cerrar Sesión"
                  variant="outline"
                  size="small"
                  onClick={handleLogout}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">No autenticado</span>
                <Button
                  text="Iniciar Sesión"
                  variant="primary"
                  size="small"
                  backlink="/login"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id, item.path)}
                className={`
                  block w-full text-left px-3 py-2 rounded-md text-base font-medium
                  transition-all duration-200 flex items-center space-x-2
                  ${
                    isAuthenticated
                      ? activeTab === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      : "text-gray-400 cursor-not-allowed opacity-50"
                  }
                `}
                disabled={!isAuthenticated}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
