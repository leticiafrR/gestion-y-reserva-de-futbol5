import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";
import { authService } from '@/services/auth.service';

export const AcceptInvitationScreen = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [teamName, setTeamName] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [token] = useToken();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitationToken = params.get("token");
    if (!invitationToken) {
      setStatus("error");
      setErrorMessage("No se proporcionó un token de invitación");
      return;
    }
    // Guardar SIEMPRE el token antes de cualquier otra acción
    if (token.state !== "LOGGED_IN") {
      setTimeout(() => setLocation("/login"), 100);
      localStorage.setItem("pendingInvitationToken", invitationToken);
      console.log("Se redirigio a login");
      return;
    }
    // Si está logueado, aceptar la invitación
    const accept = async () => {
      try {
        const teamName = await authService.acceptInvitation(invitationToken, token.accessToken);
        setTeamName(teamName || null);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error.message || "Error al aceptar la invitación");
      }
    };
    accept();
  }, [setLocation, token]);

  // Nuevo useEffect para redirigir cuando status sea 'success'
  useEffect(() => {
    if (status === "success") {
      const timeout = setTimeout(() => {
        setLocation("/main");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [status, setLocation]);

  const getContent = () => {
    switch (status) {
      case "loading":
        return {
          icon: <Loader2 size={48} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />,
          title: "Aceptando invitación...",
          description: "Por favor espera un momento",
        };
      case "success":
        return {
          icon: <CheckCircle2 size={48} color="#10b981" />,
          title: "¡Invitación aceptada!",
          description: teamName
            ? `¡Aceptaste la invitación al equipo ${teamName}! Redirigiendo...`
            : "¡Aceptaste la invitación! Redirigiendo...",
        };
      case "error":
        return {
          icon: <XCircle size={48} color="#ef4444" />,
          title: "Error al aceptar invitación",
          description: errorMessage || "El enlace no es válido o ha expirado",
        };
    }
  };

  const content = getContent();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "24px" }}>
          <span style={{ fontSize: "32px" }}>⚽</span>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "8px 0 0 0",
            }}
          >
            FutbolManager
          </h1>
        </div>

        {/* Icono de estado */}
        <div style={{ marginBottom: "20px" }}>{content.icon}</div>

        {/* Título y descripción */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "8px",
            margin: 0,
          }}
        >
          {content.title}
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "#6b7280",
            margin: "8px 0 24px 0",
          }}
        >
          {content.description}
        </p>

        {/* Botón solo si hay error */}
        {status === "error" && (
          <button
            onClick={() => setLocation("/login")}
            style={{
              width: "100%",
              padding: "12px 24px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Ir a Inicio
          </button>
        )}
      </div>
      {/* Animación CSS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}; 