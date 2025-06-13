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
      padding: "2rem", 
      maxWidth: 1200, 
      margin: "0 auto",
      backgroundColor: "var(--background)",
      minHeight: "100vh"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ color: "var(--foreground)", margin: 0, fontSize: "2rem" }}> Equipos</h1>
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
              padding: "10px 16px",
              backgroundColor: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: "14px",
              borderRadius: "var(--radius-lg)",
              transition: "all 0.2s ease",
              textDecoration: "none"
            }}
            onClick={() => {
              navigate("/main");
            }}
          >
            Volver a Inicio
          </button>
        </div>
      </div>

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