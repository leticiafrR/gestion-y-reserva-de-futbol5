import { useAllTournaments } from "@/services/TournamentService";
import { useState } from "react";

export const AvailableTournamentsScreen = () => {
  const { data: tournaments, isLoading, error } = useAllTournaments();

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto", backgroundColor: "var(--background)", minHeight: "100vh" }}>
      <h1 style={{ color: "var(--foreground)", marginBottom: "2rem", fontSize: "2rem" }}>Torneos Disponibles</h1>
      {isLoading && <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando torneos...</div>}
      {error && (
        <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>
          Error al cargar los torneos: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      )}
      {(!tournaments || tournaments.length === 0) && !isLoading && (
        <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>No hay torneos disponibles.</div>
      )}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        {tournaments?.map(tournament => {
          const formatLabel = tournament.format
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
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
              marginBottom: "1rem"
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
  );
};
