import { useAllTournaments, useTournamentByName } from "@/services/TournamentService";
import { useUserTeams } from "@/services/TeamServices";
import { useState } from "react";
import { useLocation } from "wouter";
import { JoinTournamentModal } from "./JoinTournamentModal";

export const AvailableTournamentsScreen = () => {
  const [, setLocation] = useLocation();
  const { data: tournaments, isLoading, error } = useAllTournaments();
  const [nameFilter, setNameFilter] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [selectedTournamentName, setSelectedTournamentName] = useState<string | null>(null);
  const { data: tournamentDetails, isLoading: isLoadingDetails } = useTournamentByName(selectedTournamentName || "");

  const filteredTournaments = tournaments?.filter(tournament => {
    const matchesName = tournament.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesState = stateFilter === "ALL" || tournament.state === stateFilter;
    return matchesName && matchesState;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
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
            🏟️ Torneos Disponibles
          </h1>
          <p style={{
            color: "var(--muted-foreground)",
            margin: "4px 0 0 0",
            fontSize: "14px"
          }}>
            Inscribite a los torneos abiertos
          </p>
        </div>
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
          {/* Filters */}
          <div style={{ 
            display: "flex", 
            gap: "16px", 
            marginBottom: "24px",
            flexWrap: "wrap"
          }}>
            <div style={{ flex: "1", minWidth: "200px" }}>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                  fontSize: "14px"
                }}
              />
            </div>
            <div style={{ minWidth: "200px" }}>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                <option value="ALL">Todos los estados</option>
                <option value="OPEN_TO_REGISTER">Abierto a la inscripción</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="FINISHED">Finalizado</option>
                <option value="CLOSE_TO_REGISTER_NOT_STARTED">Inscripciones finalizadas</option>
              </select>
            </div>
          </div>

          {isLoading && <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando torneos...</div>}
          {error && (
            <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>
              Error al cargar los torneos: {error instanceof Error ? error.message : 'Error desconocido'}
            </div>
          )}
          {(!filteredTournaments || filteredTournaments.length === 0) && !isLoading && (
            <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>No hay torneos disponibles.</div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
              justifyItems: "center"
            }}
          >
            {filteredTournaments?.map((tournament, idx) => {
              const formatLabel = tournament.format
                .split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
              let stateLabel = '';
              let stateBg = '';
              let stateColor = '';
              if (tournament.state === 'OPEN_TO_REGISTER') {
                stateLabel = 'Abierto a la inscripción';
                stateBg = '#10b98122';
                stateColor = '#10b981';
              } else if (tournament.state === 'CLOSE_TO_REGISTER_NOT_STARTED') {
                stateLabel = 'Inscripciones finalizadas';
                stateBg = '#f59e4222';
                stateColor = '#f59e42';
              } else if (tournament.state === 'IN_PROGRESS') {
                stateLabel = 'En progreso';
                stateBg = '#3b82f622';
                stateColor = '#2563eb';
              } else if (tournament.state === 'FINISHED') {
                stateLabel = 'Finalizado';
                stateBg = '#e5e7eb';
                stateColor = '#6b7280';
              } else {
                stateLabel = tournament.state;
                stateBg = '#e5e7eb';
                stateColor = '#6b7280';
              }
              return (
                <div key={tournament.id} style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  width: "360px",
                  background: "#f5f6fa",
                  boxShadow: "0 2px 8px var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                  cursor: "pointer"
                }}
                  onClick={() => setSelectedTournamentName(tournament.name)}
                >
                  <h2 style={{ margin: "0 0 0.5rem 0", color: "var(--foreground)", fontSize: "1.3rem", fontWeight: 700, textTransform: "uppercase" }}>{tournament.name}</h2>
                  <div style={{ color: "var(--muted-foreground)", fontSize: "1rem", marginBottom: "0.5rem" }}>
                    <span>Formato: {formatLabel}</span>
                  </div>
                  <div style={{ fontSize: "1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontWeight: 600,
                      background: stateBg,
                      color: stateColor,
                      fontSize: "0.95rem"
                    }}>
                      {stateLabel}
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
      {selectedTournamentName && (
        isLoadingDetails ? (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 32, fontSize: 18 }}>Cargando detalles...</div>
          </div>
        ) : tournamentDetails && (
          <JoinTournamentModal
            tournament={tournamentDetails}
            onClose={() => setSelectedTournamentName(null)}
          />
        )
      )}
    </div>
  );
};
