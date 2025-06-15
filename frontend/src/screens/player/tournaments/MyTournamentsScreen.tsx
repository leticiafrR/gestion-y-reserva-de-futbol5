import { useLocation } from "wouter";
import { useState } from "react";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { useUserTournaments } from "@/services/TournamentService";

export const MyTournamentsScreen = () => {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: tournaments, isLoading, error, refetch } = useUserTournaments();

  const handleCreated = () => {
    setShowCreateModal(false);
    refetch();
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
          {isLoading && <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando torneos...</div>}
          {error && (
            <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>
              Error al cargar los torneos: {error instanceof Error ? error.message : 'Error desconocido'}
            </div>
          )}
          {(!tournaments || tournaments.length === 0) && !isLoading && (
            <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>No tienes torneos propios.</div>
          )}
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "flex-start" }}>
            {tournaments?.map((tournament, idx) => {
              const formatLabel = tournament.format
                .split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
              const isLast = idx === tournaments.length - 1;
              const isOdd = tournaments.length % 2 === 1;
              return (
                <div key={tournament.id} style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  width: "420px",
                  background: "#f5f6fa",
                  boxShadow: "0 2px 8px var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                  ...(isLast && isOdd && tournaments.length > 1 ? { marginLeft: "auto" } : {})
                }}>
                  <h2 style={{ margin: "0 0 0.5rem 0", color: "var(--foreground)", fontSize: "1.3rem", fontWeight: 700, textTransform: "uppercase" }}>{tournament.name}</h2>
                  <div style={{ color: "var(--muted-foreground)", fontSize: "1rem", marginBottom: "0.5rem" }}>
                    <span>Formato: {formatLabel}</span>
                  </div>
                  <div style={{ fontSize: "1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontWeight: 600,
                      background:
                        tournament.state === "OPEN_TO_REGISTER"
                          ? "#10b98122"
                          : tournament.state === "IN_PROGRESS"
                          ? "#3b82f622"
                          : "#e5e7eb",
                      color:
                        tournament.state === "OPEN_TO_REGISTER"
                          ? "#10b981"
                          : tournament.state === "IN_PROGRESS"
                          ? "#2563eb"
                          : "#6b7280",
                      fontSize: "0.95rem"
                    }}>
                      {tournament.state === "OPEN_TO_REGISTER"
                        ? "Abierto a la inscripción"
                        : tournament.state === "IN_PROGRESS"
                        ? "En progreso"
                        : tournament.state === "FINISHED"
                        ? "Finalizado"
                        : tournament.state}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
                    <span>Desde: {tournament.startDate || "-"}</span><br />
                    <span>Hasta: {tournament.endDate || "-"}</span>
                  </div>
                </div>
              );
            })}
          </div>
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