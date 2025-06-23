import { useState } from "react";
import { Edit, Trash2, X, Eye } from "lucide-react";
import { EditTournamentModal } from "./EditTournamentModal";
import { DeleteTournamentConfirmationModal } from "./DeleteTournamentConfirmationModal";
import { useDeleteTournament } from "@/services/TournamentService";
import { useLocation } from "wouter";

interface TournamentDetailsModalProps {
  tournament: any;
  context: "organizing" | "participant" | null;
  onClose: () => void;
  onDeleted: () => void;
  onEdited: () => void;
  onSuccessToast: (message: string) => void;
}

export const TournamentDetailsModal = ({
  tournament,
  context,
  onClose,
  onDeleted,
  onEdited,
  onSuccessToast,
}: TournamentDetailsModalProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [, setLocation] = useLocation();
  
  const { mutate: deleteTournament, isPending: isDeleting } = useDeleteTournament();

  const isOrganizer = context === "organizing";
  
  const handleConfirmDelete = () => {
    deleteTournament(tournament.id, {
      onSuccess: () => {
        onSuccessToast("Torneo eliminado exitosamente.");
        onDeleted();
        onClose();
      },
      onError: (error: any) => {
        onSuccessToast(`Error al eliminar: ${error.message}`);
      }
    });
  };

  const handleGoToFixture = () => {
    setLocation(`/my-tournaments/fixture/${encodeURIComponent(tournament.name)}`);
    onClose();
  };
  
  const getStateLabel = (state: string) => {
    switch (state) {
      case "OPEN_TO_REGISTER": return "Abierto a la inscripción";
      case "CLOSE_TO_REGISTER_NOT_STARTED": return "Inscripciones finalizadas";
      case "IN_PROGRESS": return "En progreso";
      case "FINISHED": return "Finalizado";
      default: return state;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "OPEN_TO_REGISTER": return { bg: "#10b98122", color: "#10b981" };
      case "CLOSE_TO_REGISTER_NOT_STARTED": return { bg: "#f59e4222", color: "#f59e42" };
      case "IN_PROGRESS": return { bg: "#3b82f622", color: "#2563eb" };
      case "FINISHED": return { bg: "#e5e7eb", color: "#6b7280" };
      default: return { bg: "#e5e7eb", color: "#6b7280" };
    }
  };

  const stateInfo = getStateColor(tournament.state);
  const formatLabel = tournament.format
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const canShowFixtureButton = isOrganizer && (
    tournament.state === "CLOSE_TO_REGISTER_NOT_STARTED" ||
    tournament.state === "IN_PROGRESS" ||
    tournament.state === "FINISHED"
  );

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ background: "white", borderRadius: 12, maxWidth: 500, width: "100%", padding: 32, boxShadow: "0 2px 12px #0002", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}>
            <X size={24} />
          </button>
          <h2 style={{ marginBottom: 4, fontSize: 22, fontWeight: 700 }}>{tournament.name}</h2>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ padding: "4px 10px", borderRadius: "4px", fontWeight: 600, background: stateInfo.bg, color: stateInfo.color, fontSize: "0.95rem" }}>
              {getStateLabel(tournament.state)}
            </span>
          </div>
          <div style={{ marginBottom: 16, borderTop: "1px solid #eee", paddingTop: 16 }}>
            <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Formato:</b> {formatLabel}</div>
            <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Desde:</b> {tournament.startDate || "-"}</div>
            <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Hasta:</b> {tournament.endDate || "-"}</div>
            <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Equipos:</b> {tournament.registeredTeams ?? 0} / {tournament.maxTeams ?? "-"}</div>
            {tournament.description && <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Descripción:</b> {tournament.description}</div>}
            {tournament.prizes && <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Premios:</b> {tournament.prizes}</div>}
            {tournament.registrationFee > 0 && <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Inscripción:</b> ${tournament.registrationFee}</div>}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            {canShowFixtureButton && (
                <button 
                  onClick={handleGoToFixture} 
                  style={{ padding: "10px 18px", background: "#10b981", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Eye size={16} /> Fixture
                </button>
            )}
            {isOrganizer && (
              <>
                <button onClick={() => setShowEditModal(true)} style={{ padding: "10px 18px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                  <Edit size={16} /> Editar
                </button>
                <button onClick={() => setShowDeleteModal(true)} style={{ padding: "10px 18px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showEditModal && (
        <EditTournamentModal
          tournament={tournament}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            onEdited();
          }}
          onSuccessToast={onSuccessToast}
        />
      )}
      {showDeleteModal && (
        <DeleteTournamentConfirmationModal
          tournamentName={tournament.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}; 