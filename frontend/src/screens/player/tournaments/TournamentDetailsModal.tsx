import { X } from "lucide-react";
import { useDeleteTournament } from "@/services/TournamentService";
import { useState } from "react";
import { EditTournamentModal } from "./EditTournamentModal";
import { DeleteTournamentConfirmationModal } from "./DeleteTournamentConfirmationModal";

interface TournamentDetailsModalProps {
  tournament: any;
  onClose: () => void;
  onDeleted: () => void;
}

export const TournamentDetailsModal = ({ tournament, onClose, onDeleted }: TournamentDetailsModalProps) => {
  const { mutate: deleteTournament, isPending: isDeleting } = useDeleteTournament();
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localTournament, setLocalTournament] = useState(tournament);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  return (
    <>
      {!showEditModal && !showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: "1px solid #e5e7eb",
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 1,
              }}
            >
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", margin: "0 0 4px 0" }}>
                  {localTournament.name}
                </h2>
                <span style={{
                  padding: "6px 12px",
                  backgroundColor:
                    localTournament.state === "OPEN_TO_REGISTER"
                      ? "#10b981"
                      : localTournament.state === "IN_PROGRESS"
                      ? "#2563eb"
                      : "#6b7280",
                  color: "white",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  display: "inline-block"
                }}>
                  {localTournament.state === "OPEN_TO_REGISTER"
                    ? "Abierto a la inscripción"
                    : localTournament.state === "IN_PROGRESS"
                    ? "En progreso"
                    : localTournament.state === "FINISHED"
                    ? "Finalizado"
                    : localTournament.state}
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: "8px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  color: "#374151",
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ color: "#374151", fontSize: "16px", marginBottom: "8px" }}>
                  <b>Formato:</b> {localTournament.format}
                </div>
                <div style={{ color: "#374151", fontSize: "16px", marginBottom: "8px" }}>
                  <b>Desde:</b> {localTournament.startDate || "-"}
                </div>
                <div style={{ color: "#374151", fontSize: "16px", marginBottom: "8px" }}>
                  <b>Hasta:</b> {localTournament.endDate || "-"}
                </div>
                {localTournament.description && (
                  <div style={{ color: "#374151", fontSize: "16px", marginBottom: "8px" }}>
                    <b>Descripción:</b> {localTournament.description}
                  </div>
                )}
                {localTournament.prizes && (
                  <div style={{ color: "#374151", fontSize: "16px", marginBottom: "8px" }}>
                    <b>Premios:</b> {localTournament.prizes}
                  </div>
                )}
                {localTournament.registrationFee !== undefined && (
                  <div style={{ color: "#374151", fontSize: "16px", marginBottom: "8px" }}>
                    <b>Inscripción:</b> ${localTournament.registrationFee}
                  </div>
                )}
              </div>
              {error && <div style={{ color: "#ef4444", marginBottom: "12px" }}>{error}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "15px",
                    cursor: "pointer"
                  }}
                  onClick={handleEdit}
                  disabled={isDeleting}
                >
                  Editar
                </button>
                <button
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "15px",
                    cursor: isDeleting ? "not-allowed" : "pointer"
                  }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <EditTournamentModal
          tournament={localTournament}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            // Refrescar datos locales (idealmente deberías refetchear desde backend)
            onDeleted(); // Refresca la lista en el padre
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteTournamentConfirmationModal
          tournamentName={localTournament.name}
          isDeleting={isDeleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            deleteTournament(localTournament.id, {
              onSuccess: () => {
                setShowDeleteModal(false);
                onDeleted();
                onClose();
              },
              onError: (err: any) => {
                setError(err?.message || "Error al eliminar torneo");
              }
            });
          }}
        />
      )}
    </>
  );
}; 