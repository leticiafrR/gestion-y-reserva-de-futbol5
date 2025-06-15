import { useLocation } from "wouter";
import { useState } from "react";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { useUserTournaments, useTournamentByName } from "@/services/TournamentService";
import { TournamentDetailsModal } from "./TournamentDetailsModal";

export const MyTournamentsScreen = () => {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<any | null>(null);
  const [selectedTournamentName, setSelectedTournamentName] = useState<string | null>(null);
  const { data: tournamentDetails, isLoading: isLoadingDetails } = useTournamentByName(selectedTournamentName || "");

  const { data: tournaments, isLoading, error, refetch } = useUserTournaments();

  // Tabs y filtro
  const [activeTab, setActiveTab] = useState<'activos' | 'finalizados'>('activos');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN_TO_REGISTER'>('ALL');

  // Filtrado de torneos
  const activeTournaments = tournaments?.filter(t =>
    t.state === 'OPEN_TO_REGISTER' ||
    t.state === 'CLOSE_TO_REGISTER_NOT_STARTED' ||
    t.state === 'IN_PROGRESS') || [];
  const finishedTournaments = tournaments?.filter(t => t.state === 'FINISHED') || [];
  const filteredActiveTournaments = activeTournaments.filter(t => activeFilter === 'ALL' || t.state === 'OPEN_TO_REGISTER');

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

      {/* Tabs */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 24px auto", display: "flex", gap: 16 }}>
        <button
          onClick={() => setActiveTab('activos')}
          style={{
            padding: "10px 24px",
            borderRadius: "8px 8px 0 0",
            border: "none",
            background: activeTab === 'activos' ? "#3b82f6" : "#e5e7eb",
            color: activeTab === 'activos' ? "white" : "#374151",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Torneos activos
        </button>
        <button
          onClick={() => setActiveTab('finalizados')}
          style={{
            padding: "10px 24px",
            borderRadius: "8px 8px 0 0",
            border: "none",
            background: activeTab === 'finalizados' ? "#3b82f6" : "#e5e7eb",
            color: activeTab === 'finalizados' ? "white" : "#374151",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Torneos finalizados
        </button>
      </div>

      {/* Filtro solo en activos */}
      {activeTab === 'activos' && (
        <div style={{ maxWidth: "1200px", margin: "0 auto 16px auto", display: "flex", justifyContent: "flex-end" }}>
          <select
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value as 'ALL' | 'OPEN_TO_REGISTER')}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            <option value="ALL">Todos los activos</option>
            <option value="OPEN_TO_REGISTER">Solo abiertos a inscripción</option>
          </select>
        </div>
      )}

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
          {activeTab === 'activos' && (!filteredActiveTournaments || filteredActiveTournaments.length === 0) && !isLoading && (
            <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>No tienes torneos activos.</div>
          )}
          {activeTab === 'finalizados' && (!finishedTournaments || finishedTournaments.length === 0) && !isLoading && (
            <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>No tienes torneos finalizados.</div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
              justifyItems: "center"
            }}
          >
            {(activeTab === 'activos' ? filteredActiveTournaments : finishedTournaments).map((tournament, idx) => {
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
              const isLast = idx === (activeTab === 'activos' ? filteredActiveTournaments : finishedTournaments).length - 1;
              const isOdd = (activeTab === 'activos' ? filteredActiveTournaments : finishedTournaments).length % 2 === 1;
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
      {selectedTournamentName && (
        isLoadingDetails ? (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 32, fontSize: 18 }}>Cargando detalles...</div>
          </div>
        ) : tournamentDetails && (
          <TournamentDetailsModal
            tournament={tournamentDetails}
            onClose={() => setSelectedTournamentName(null)}
            onDeleted={() => {
              setSelectedTournamentName(null);
              refetch();
            }}
            onEdited={refetch}
          />
        )
      )}
    </div>
  );
}; 