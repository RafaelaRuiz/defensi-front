"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatBot from "@/components/ChatBot";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  createdAt: string;
  meta?: {
    context?: string;
    complianceLevel?: string;
    suggestedActions?: string[];
  };
}

interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  status: "processing" | "ready" | "error";
  analysisResults?: {
    complianceScore: number;
    issues: string[];
    recommendations: string[];
  };
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "documents">("chat");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadChatHistory();
      loadDocuments();
    }
  }, [isAuthenticated, user?.id]);

  const loadChatHistory = async () => {
    if (!user?.id) return;

    setLoadingHistory(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const token = localStorage.getItem("token");

      const response = await fetch(`${api}/ai/chat/history/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const history = await response.json();
        setChatHistory(history);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadDocuments = async () => {
    if (!user?.id) return;

    setLoadingDocuments(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const token = localStorage.getItem("token");

      // Este endpoint necesitaría implementarse en el backend
      const response = await fetch(`${api}/users/${user.id}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      // Mock data para demostración
      setDocuments([
        {
          id: "1",
          filename: "politica-seguridad.pdf",
          originalName: "Política de Seguridad Empresarial.pdf",
          mimeType: "application/pdf",
          size: 245760,
          uploadedAt: "2025-10-08T10:30:00Z",
          status: "ready",
          analysisResults: {
            complianceScore: 75,
            issues: [
              "Falta definición de roles específicos",
              "No se especifica periodicidad de revisión",
            ],
            recommendations: [
              "Incluir matriz RACI",
              "Establecer calendario de revisiones",
            ],
          },
        },
        {
          id: "2",
          filename: "manual-iso27001.docx",
          originalName: "Manual ISO 27001 v2.1.docx",
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 512000,
          uploadedAt: "2025-10-07T14:15:00Z",
          status: "ready",
          analysisResults: {
            complianceScore: 92,
            issues: ["Anexo A.12.3 incompleto"],
            recommendations: [
              "Completar controles de gestión de vulnerabilidades",
            ],
          },
        },
      ]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingFile(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      // Este endpoint necesitaría implementarse en el backend
      const response = await fetch(`${api}/users/${user.id}/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        await loadDocuments(); // Recargar la lista
      } else {
        alert("Error subiendo el archivo");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error subiendo el archivo");
    } finally {
      setUploadingFile(false);
      // Reset input
      event.target.value = "";
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este documento?"))
      return;

    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${api}/users/${user?.id}/documents/${docId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      } else {
        alert("Error eliminando el documento");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Error eliminando el documento");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Listo
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Procesando
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Error
          </span>
        );
      default:
        return null;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Gestiona tu historial de chat y documentos para análisis de
            cumplimiento
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("chat")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "chat"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                💬 Historial de Chat
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "documents"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📁 Documentos para IA
              </button>
            </nav>
          </div>
        </div>

        {/* Chat History Tab */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Historial de Conversaciones
              </h2>
              <button
                onClick={loadChatHistory}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                🔄 Actualizar
              </button>
            </div>
            <div className="p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">
                    Cargando historial...
                  </span>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">💬</div>
                  <p className="text-gray-500 text-lg">
                    No tienes conversaciones aún
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Inicia una conversación con el asistente de IA
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {new Date(message.createdAt).toLocaleString()}
                        </div>
                        {message.meta?.context && (
                          <div className="text-xs mt-1 opacity-80">
                            📍 Contexto: {message.meta.context}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Documentos para Análisis de IA
              </h2>
              <div className="flex space-x-3">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    uploadingFile
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  {uploadingFile ? "⏳ Subiendo..." : "📤 Subir Documento"}
                </label>
                <button
                  onClick={loadDocuments}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  🔄 Actualizar
                </button>
              </div>
            </div>
            <div className="p-6">
              {loadingDocuments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">
                    Cargando documentos...
                  </span>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📁</div>
                  <p className="text-gray-500 text-lg">
                    No tienes documentos subidos
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Sube documentos para que la IA pueda analizarlos
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {doc.mimeType.includes("pdf")
                              ? "📄"
                              : doc.mimeType.includes("word")
                              ? "📝"
                              : "📄"}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {doc.originalName}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.size)} •{" "}
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(doc.status)}
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {doc.analysisResults && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Puntuación de Cumplimiento
                              </p>
                              <p
                                className={`text-lg font-semibold ${getComplianceColor(
                                  doc.analysisResults.complianceScore
                                )}`}
                              >
                                {doc.analysisResults.complianceScore}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Problemas Detectados
                              </p>
                              <p className="text-sm text-gray-700">
                                {doc.analysisResults.issues.length} problemas
                              </p>
                              {doc.analysisResults.issues.length > 0 && (
                                <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                  {doc.analysisResults.issues
                                    .slice(0, 2)
                                    .map((issue, idx) => (
                                      <li key={idx}>{issue}</li>
                                    ))}
                                  {doc.analysisResults.issues.length > 2 && (
                                    <li>
                                      ...y{" "}
                                      {doc.analysisResults.issues.length - 2}{" "}
                                      más
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Recomendaciones
                              </p>
                              <p className="text-sm text-gray-700">
                                {doc.analysisResults.recommendations.length}{" "}
                                sugerencias
                              </p>
                              {doc.analysisResults.recommendations.length >
                                0 && (
                                <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                  {doc.analysisResults.recommendations
                                    .slice(0, 2)
                                    .map((rec, idx) => (
                                      <li key={idx}>{rec}</li>
                                    ))}
                                  {doc.analysisResults.recommendations.length >
                                    2 && (
                                    <li>
                                      ...y{" "}
                                      {doc.analysisResults.recommendations
                                        .length - 2}{" "}
                                      más
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante del chat */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors z-40"
        title="Asistente de Cumplimiento"
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
          />
        </svg>
      </button>

      {/* ChatBot Component */}
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
