import { useLocation } from "wouter";
import { useState } from "react";
import { CreateTournamentModal } from "./CreateTournamentModal";

export const MyTournamentsScreen = () => {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreated = () => {
    setShowCreateModal(false);
    // Aquí deberías refrescar la lista de torneos propios cuando esté implementada
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--background)",
      padding: "24px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        backgroundColor: "var(--card)",
        borderRadius: "12px",
        boxShadow: "0 1px 3px var(--border)",
        marginBottom: "32px"
      }}>
        <div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "var(--foreground)",
            margin: 0
          }}>
            🏆 Mis Torneos
          </h1>
          <p style={{
            color: "var(--muted-foreground)",
            margin: "4px 0 0 0",
            fontSize: "14px"
          }}>
            Gestiona tus torneos activos
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "10px 16px",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Crear Torneo
          </button>
          <button
            onClick={() => setLocation("/main")}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--secondary)",
              border: "1px solid transparent",
              borderRadius: "8px",
              color: "var(--secondary-foreground)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "var(--accent)";
              e.currentTarget.style.borderColor = "black";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "var(--secondary)";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            Volver a Inicio
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 16px"
      }}>
        <div style={{
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px var(--border)"
        }}>
          <p style={{
            color: "var(--muted-foreground)",
            textAlign: "center",
            fontSize: "16px"
          }}>
            Aquí podrás ver y gestionar tus torneos activos
          </p>
        </div>
      </main>
      {showCreateModal && (
        <CreateTournamentModal
          onClose={handleCreated}
          onError={msg => setErrorMessage(msg)}
        />
      )}
      {errorMessage && (
        <div style={{
          position: "fixed",
          top: 30,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#dc3545",
          color: "white",
          padding: "12px 24px",
          borderRadius: 8,
          zIndex: 2000,
          fontWeight: 500,
          fontSize: 16
        }}>
          {errorMessage}
          <button onClick={() => setErrorMessage(null)} style={{ marginLeft: 16, background: "none", border: "none", color: "white", fontWeight: 700, cursor: "pointer" }}>X</button>
        </div>
      )}
    </div>
  );
}; 