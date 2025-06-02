"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export const VerifyEmailScreen = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const token = params.get("token")

        if (!token) {
          setStatus("error")
          return
        }

        // Simular verificación - reemplazar con tu API
        const response = await fetch(`/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          setStatus("success")
          // Redirigir después de 3 segundos
          setTimeout(() => {
            window.location.href = "/login"
          }, 3000)
        } else {
          setStatus("error")
        }
      } catch (error) {
        setStatus("error")
      }
    }

    verifyEmail()
  }, [])

  const getContent = () => {
    switch (status) {
      case "loading":
        return {
          icon: <Loader2 size={48} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />,
          title: "Verificando email...",
          description: "Por favor espera un momento",
        }
      case "success":
        return {
          icon: <CheckCircle2 size={48} color="#10b981" />,
          title: "¡Email verificado!",
          description: "Redirigiendo al login...",
        }
      case "error":
        return {
          icon: <XCircle size={48} color="#ef4444" />,
          title: "Error de verificación",
          description: "El enlace no es válido o ha expirado",
        }
    }
  }

  const content = getContent()

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
            fontSize: "14px",
            color: "#6b7280",
            margin: "8px 0 24px 0",
          }}
        >
          {content.description}
        </p>

        {/* Botón solo si hay error */}
        {status === "error" && (
          <button
            onClick={() => (window.location.href = "/login")}
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
            Volver al Login
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
  )
}
