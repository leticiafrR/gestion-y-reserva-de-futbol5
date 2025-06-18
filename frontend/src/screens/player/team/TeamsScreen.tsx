import { useUserTeams } from "@/services/TeamServices";
import { navigate } from "wouter/use-browser-location";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { Team } from "@/models/Team";
import { useQueryClient } from "@tanstack/react-query";
import { useToken } from "@/services/TokenContext";
import { CreateTeamModal } from "@/screens/player/team/CreateTeamModal";
import { EditTeamModal } from "@/screens/player/team/EditTeamModal";
import { DeleteConfirmationModal } from "@/screens/player/team/DeleteConfirmationModal";
import { ErrorPopup } from "@/screens/player/team/ErrorPopup";
import { TeamDetailsModal } from "@/screens/player/team/TeamDetailsModal";
import { TeamCard } from "@/screens/player/team/TeamCard";

export const TeamsScreen = () => {
  const { data: teams, isLoading, error } = useUserTeams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDeleteId, setTeamToDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState<Team | null>(null);

  const queryClient = useQueryClient();
  const [token] = useToken();
  const userEmail = token.state === "LOGGED_IN" ? token.email : null;

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando equipos...</div>;
  if (error) return (
    <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>
      Error al cargar los equipos: {error instanceof Error ? error.message : 'Error desconocido'}
      <br />
      <button
        onClick={() => queryClient.invalidateQueries({ queryKey: ["userTeams"] })}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          border: "none",
          borderRadius: "var(--radius)",
          cursor: "pointer"
        }}
      >
        Reintentar
      </button>
    </div>
  );

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
            👫 Equipos
          </h1>
          <p style={{
            color: "var(--muted-foreground)",
            margin: "4px 0 0 0",
            fontSize: "14px"
          }}>
            Gestiona tus equipos y miembros
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            style={{
              padding: "10px 16px",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Crear Equipo
          </button>
          <button
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
            onClick={() => {
              navigate("/main");
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
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
            {teams?.length === 0 && (
              <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>No participas en ningún equipo.</div>
            )}
            {teams?.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                userEmail={userEmail}
                onEdit={() => {
                  setSelectedTeam(team);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setTeamToDeleteId(team.id);
                  setShowDeleteModal(true);
                }}
                onDetails={() => {
                  setSelectedTeamForDetails(team);
                  setShowDetailsModal(true);
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal 
          onClose={() => setShowCreateModal(false)} 
          onError={setErrorMessage}
        />
      )}

      {showEditModal && selectedTeam && (
        <EditTeamModal
          team={selectedTeam}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeam(null);
          }}
          onError={setErrorMessage}
        />
      )}

      {showDeleteModal && teamToDeleteId && (
        <DeleteConfirmationModal
          teamId={teamToDeleteId}
          teamName={teams?.find(t => t.id === teamToDeleteId)?.name || 'este equipo'}
          onClose={() => setShowDeleteModal(false)}
          onError={setErrorMessage}
        />
      )}

      {showDetailsModal && selectedTeamForDetails && (
        <TeamDetailsModal
          team={selectedTeamForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTeamForDetails(null);
          }}
          onError={setErrorMessage}
        />
      )}

      {/* Error Popup */}
      {errorMessage && (
        <ErrorPopup message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
    </div>
  );
}; 