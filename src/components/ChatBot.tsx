"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestedActions?: string[];
  complianceLevel?: "compliant" | "non_compliant" | "needs_review";
  relatedDocuments?: string[];
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showLaw1581Form, setShowLaw1581Form] = useState(false);
  const [law1581Data, setLaw1581Data] = useState({
    nit: "",
    companyName: "",
    websiteUrl: "",
    generatePdf: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
      showWelcomeMessage();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    if (!user?.id) return;

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
        const formattedMessages: Message[] = history.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          suggestedActions: msg.meta?.suggestedActions,
          complianceLevel: msg.meta?.complianceLevel,
          relatedDocuments: msg.meta?.relatedDocuments,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const showWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "bot",
      content: `¡Hola ${user?.username || "Usuario"}! 👋 

Soy tu asistente de cumplimiento normativo. Puedo ayudarte con:

🔍 **Análisis general de cumplimiento**
📋 **Revisión de documentos de seguridad**
🛡️ **Evaluación de políticas ISO 27001**
🇨🇴 **Análisis específico Ley 1581 de Colombia**

¿En qué te puedo ayudar hoy?`,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
  };

  const quickOptions = [
    {
      id: "general",
      label: "📊 Análisis General",
      description: "Revisar mi estado de cumplimiento actual",
    },
    {
      id: "iso27001",
      label: "🛡️ ISO 27001",
      description: "Evaluación de cumplimiento ISO 27001",
    },
    {
      id: "law1581",
      label: "🇨🇴 Ley 1581",
      description: "Análisis protección datos Colombia",
    },
    {
      id: "documents",
      label: "📋 Documentos",
      description: "Revisar mis documentos de seguridad",
    },
  ];

  const handleQuickOption = async (optionId: string) => {
    setSelectedOption(optionId);

    if (optionId === "law1581") {
      setShowLaw1581Form(true);
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content:
          "Quiero hacer un análisis de cumplimiento con la Ley 1581 de Colombia",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      return;
    }

    const optionMessages: { [key: string]: string } = {
      general:
        "Dame un análisis general de mi estado de cumplimiento normativo",
      iso27001: "Revisa mi cumplimiento con la norma ISO 27001",
      documents: "Analiza mis documentos de seguridad actuales",
    };

    const message = optionMessages[optionId];
    if (message) {
      await sendMessage(message);
    }
  };

  const handleLaw1581Analysis = async () => {
    if (!law1581Data.nit || !law1581Data.companyName) {
      alert("Por favor completa al menos el NIT y nombre de la empresa");
      return;
    }

    setIsLoading(true);
    setShowLaw1581Form(false);

    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const token = localStorage.getItem("token");

      const response = await fetch(`${api}/ai/law-1581/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          ...law1581Data,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        let responseContent = `**📋 Análisis Ley 1581 - ${law1581Data.companyName}**\n\n`;

        if (result.complianceAnalysis?.hasPrivacyPolicy) {
          responseContent += `✅ **Política encontrada en el sitio web**\n`;
          responseContent += `📊 **Puntuación de cumplimiento:** ${
            result.complianceAnalysis.overallScore || "N/A"
          }%\n\n`;

          if (result.complianceAnalysis.strengths?.length > 0) {
            responseContent += `**💪 Fortalezas detectadas:**\n`;
            result.complianceAnalysis.strengths.forEach((strength: string) => {
              responseContent += `• ${strength}\n`;
            });
            responseContent += "\n";
          }

          if (result.complianceAnalysis.deficiencies?.length > 0) {
            responseContent += `**⚠️ Deficiencias encontradas:**\n`;
            result.complianceAnalysis.deficiencies.forEach(
              (deficiency: string) => {
                responseContent += `• ${deficiency}\n`;
              }
            );
            responseContent += "\n";
          }
        } else {
          responseContent += `❌ **No se encontró política de privacidad**\n\n`;

          if (result.generatedPolicy?.suggested) {
            responseContent += `📝 **He generado una política personalizada para tu empresa.**\n\n`;

            if (
              result.generatedPolicy.pdfGenerated &&
              result.generatedPolicy.downloadUrl
            ) {
              responseContent += `📄 **PDF generado exitosamente**\n`;
              responseContent += `🔗 [Descargar Política en PDF](${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"
              }${result.generatedPolicy.downloadUrl})\n\n`;
            }

            responseContent += `**Pasos de implementación:**\n`;
            result.generatedPolicy.implementationSteps?.forEach(
              (step: string, index: number) => {
                responseContent += `${index + 1}. ${step}\n`;
              }
            );
          }
        }

        if (result.complianceAnalysis?.recommendations?.length > 0) {
          responseContent += `\n**🎯 Recomendaciones:**\n`;
          result.complianceAnalysis.recommendations.forEach((rec: string) => {
            responseContent += `• ${rec}\n`;
          });
        }

        const botMessage: Message = {
          id: Date.now().toString(),
          role: "bot",
          content: responseContent,
          timestamp: new Date(),
          complianceLevel: result.complianceAnalysis?.meetsLaw1581Requirements
            ? "compliant"
            : "needs_review",
          suggestedActions:
            result.complianceAnalysis?.recommendations?.slice(0, 3) || [],
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Error en el análisis");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "bot",
        content:
          "Lo siento, hubo un error al realizar el análisis de Ley 1581. Por favor intenta nuevamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLaw1581Data({
        nit: "",
        companyName: "",
        websiteUrl: "",
        generatePdf: false,
      });
    }
  };

  const sendMessage = async (messageText: string = inputMessage) => {
    if (!messageText.trim() || !user?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
      const token = localStorage.getItem("token");

      const response = await fetch(`${api}/ai/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          userId: user.id,
          context: selectedOption || "general",
        }),
      });

      if (response.ok) {
        const result = await response.json();

        const botMessage: Message = {
          id: result.id || Date.now().toString(),
          role: "bot",
          content: result.response,
          timestamp: new Date(result.timestamp),
          suggestedActions: result.suggestedActions,
          complianceLevel: result.complianceLevel,
          relatedDocuments: result.relatedDocuments,
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "bot",
        content:
          "Lo siento, hubo un error procesando tu consulta. Por favor intenta nuevamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setSelectedOption(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getComplianceBadge = (level?: string) => {
    switch (level) {
      case "compliant":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Conforme
          </span>
        );
      case "non_compliant":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ No conforme
          </span>
        );
      case "needs_review":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⚠️ Necesita revisión
          </span>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Asistente de Cumplimiento
              </h3>
              <p className="text-sm text-gray-500">
                Especialista en normatividad y seguridad
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {message.complianceLevel && (
                  <div className="mt-2">
                    {getComplianceBadge(message.complianceLevel)}
                  </div>
                )}

                {message.suggestedActions &&
                  message.suggestedActions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        🎯 Acciones sugeridas:
                      </p>
                      {message.suggestedActions.map((action, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 bg-blue-50 p-2 rounded"
                        >
                          • {action}
                        </div>
                      ))}
                    </div>
                  )}

                {message.relatedDocuments &&
                  message.relatedDocuments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">
                        📄 Documentos relacionados:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {message.relatedDocuments.map((doc, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Options */}
          {messages.length <= 1 && !isLoading && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {quickOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleQuickOption(option.id)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Ley 1581 Form */}
          {showLaw1581Form && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">
                📋 Información para análisis Ley 1581
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIT de la empresa *
                  </label>
                  <input
                    type="text"
                    value={law1581Data.nit}
                    onChange={(e) =>
                      setLaw1581Data((prev) => ({
                        ...prev,
                        nit: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="123456789-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la empresa *
                  </label>
                  <input
                    type="text"
                    value={law1581Data.companyName}
                    onChange={(e) =>
                      setLaw1581Data((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Mi Empresa S.A.S."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Página web (opcional)
                  </label>
                  <input
                    type="url"
                    value={law1581Data.websiteUrl}
                    onChange={(e) =>
                      setLaw1581Data((prev) => ({
                        ...prev,
                        websiteUrl: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="https://www.miempresa.com"
                  />
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="generatePdf"
                    checked={law1581Data.generatePdf}
                    onChange={(e) =>
                      setLaw1581Data((prev) => ({
                        ...prev,
                        generatePdf: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="generatePdf"
                    className="text-sm text-gray-700"
                  >
                    📄 Generar política en formato PDF
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleLaw1581Analysis}
                    disabled={!law1581Data.nit || !law1581Data.companyName}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Analizar Cumplimiento
                  </button>
                  <button
                    onClick={() => setShowLaw1581Form(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-gray-600 text-sm">Analizando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu consulta sobre cumplimiento normativo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
