import { useLocation } from "wouter";
import { useState } from "react";
import { CreateTournamentModal } from "./CreateTournamentModal";
import { useUserTournaments, useTournamentByName, useParticipatingTournaments } from "@/services/TournamentService";
import { TournamentDetailsModal } from "./TournamentDetailsModal";

export const MyTournamentsScreen = () => {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<any | null>(null);
  const [selectedTournamentName, setSelectedTournamentName] = useState<string | null>(null);
  const { data: tournamentDetails, isLoading: isLoadingDetails } = useTournamentByName(selectedTournamentName || "");

  // Datos de torneos que organizo
  const { data: organizedTournaments, isLoading: isLoadingOrganized, error: organizedError, refetch } = useUserTournaments();
  
  // Datos de torneos en los que participo
  const { data: participatingTournaments, isLoading: isLoadingParticipating, error: participatingError } = useParticipatingTournaments();

  // Estado de pestañas
  const [activeTab, setActiveTab] = useState<'organizing' | 'participating'>('organizing');
  const [context, setContext] = useState<'organizing' | 'participant' | null>(null);

  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const handleCreated = () => {
    setShowCreateModal(false);
    refetch();
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'OPEN_TO_REGISTER': return 'Abierto a la inscripción';
      case 'CLOSE_TO_REGISTER_NOT_STARTED': return 'Inscripciones finalizadas';
      case 'IN_PROGRESS': return 'En progreso';
      case 'FINISHED': return 'Finalizado';
      default: return state;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'OPEN_TO_REGISTER': return { bg: '#10b98122', color: '#10b981' };
      case 'CLOSE_TO_REGISTER_NOT_STARTED': return { bg: '#f59e4222', color: '#f59e42' };
      case 'IN_PROGRESS': return { bg: '#3b82f622', color: '#2563eb' };
      case 'FINISHED': return { bg: '#e5e7eb', color: '#6b7280' };
      default: return { bg: '#e5e7eb', color: '#6b7280' };
    }
  };

  const renderTournamentCard = (tournament: any, isOrganizer: boolean = false) => {
    const formatLabel = tournament.format
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    const stateInfo = getStateColor(tournament.state);
    
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
        onClick={() => {
          setSelectedTournamentName(tournament.name);
          setContext(isOrganizer ? 'organizing' : 'participant');
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", marginBottom: "0.5rem" }}>
          <h2 style={{ margin: 0, color: "var(--foreground)", fontSize: "1.3rem", fontWeight: 700, textTransform: "uppercase", flex: 1 }}>{tournament.name}</h2>
          {isOrganizer && (
            <span style={{
              padding: "2px 6px",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "500"
            }}>
              ORGANIZADOR
            </span>
          )}
        </div>
        <div style={{ color: "var(--muted-foreground)", fontSize: "1rem", marginBottom: "0.5rem" }}>
          <span>Formato: {formatLabel}</span>
        </div>
        <div style={{ fontSize: "1rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            padding: "4px 10px",
            borderRadius: "4px",
            fontWeight: 600,
            background: stateInfo.bg,
            color: stateInfo.color,
            fontSize: "0.95rem"
          }}>
            {getStateLabel(tournament.state)}
          </span>
        </div>
        <div style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
          <span>Desde: {tournament.startDate || "-"}</span><br />
          <span>Hasta: {tournament.endDate || "-"}</span>
        </div>
      </div>
    );
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
            Gestiona tus torneos y participaciones
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
          boxShadow: "0 1px 3px var(--border)"
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            <button
              onClick={() => setActiveTab('organizing')}
              style={{
                flex: 1,
                padding: "12px 0",
                background: activeTab === 'organizing' ? '#3b82f6' : 'white',
                color: activeTab === 'organizing' ? 'white' : '#3b82f6',
                border: '1px solid #3b82f6',
                borderBottom: activeTab === 'organizing' ? 'none' : '1px solid #3b82f6',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 0,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            >
              Mis Torneos Creados
            </button>
            <button
              onClick={() => setActiveTab('participating')}
              style={{
                flex: 1,
                padding: "12px 0",
                background: activeTab === 'participating' ? '#3b82f6' : 'white',
                color: activeTab === 'participating' ? 'white' : '#3b82f6',
                border: '1px solid #3b82f6',
                borderBottom: activeTab === 'participating' ? 'none' : '1px solid #3b82f6',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            >
              Torneos en los que Participo
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div style={{ background: 'white', border: 'none', borderRadius: '0 0 8px 8px', padding: '2rem 1rem', minHeight: 200 }}>
            
            {/* Pestaña: Mis Torneos Creados */}
            {activeTab === 'organizing' && (
              <div>
                {/* Estados de carga y error */}
                {isLoadingOrganized && <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando tus torneos creados...</div>}
                {organizedError && (
                  <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>
                    Error al cargar tus torneos creados: {organizedError instanceof Error ? organizedError.message : 'Error desconocido'}
                  </div>
                )}

                {/* Contenido de torneos organizados */}
                {!isLoadingOrganized && !organizedError && (
                  <div>
                    {!organizedTournaments || organizedTournaments.length === 0 ? (
                      <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem", textAlign: "center", padding: "30px" }}>
                        No has creado ningún torneo aún.
                      </div>
                    ) : (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "2rem",
                        justifyItems: "center"
                      }}>
                        {organizedTournaments.map(tournament => renderTournamentCard(tournament, true))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pestaña: Torneos en los que Participo */}
            {activeTab === 'participating' && (
              <div>
                {/* Estados de carga y error */}
                {isLoadingParticipating && <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando torneos en los que participas...</div>}
                {participatingError && (
                  <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>
                    Error al cargar los torneos en los que participas: {participatingError instanceof Error ? participatingError.message : 'Error desconocido'}
                  </div>
                )}

                {/* Contenido de torneos en los que participo */}
                {!isLoadingParticipating && !participatingError && (
                  <div>
                    {!participatingTournaments || participatingTournaments.length === 0 ? (
                      <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem", textAlign: "center", padding: "30px" }}>
                        No participas en ningún torneo.
                      </div>
                    ) : (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "2rem",
                        justifyItems: "center"
                      }}>
                        {participatingTournaments.map(tournament => renderTournamentCard(tournament, false))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateTournamentModal
          onClose={() => setShowCreateModal(false)}
          onError={setErrorMessage}
        />
      )}

      {selectedTournamentName && tournamentDetails && (
        <TournamentDetailsModal
          tournament={tournamentDetails}
          context={context}
          onClose={() => {
            setSelectedTournamentName(null);
            setSelectedTournament(null);
            setContext(null);
          }}
          onDeleted={() => {
            setSelectedTournamentName(null);
            setSelectedTournament(null);
            setContext(null);
            refetch();
          }}
          onEdited={() => {
            refetch();
            setContext(null);
          }}
          onSuccessToast={setGlobalToast}
        />
      )}

      {/* Toast */}
      {globalToast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          padding: "12px 24px",
          borderRadius: "8px",
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          {globalToast}
        </div>
      )}
    </div>
  );
}; 