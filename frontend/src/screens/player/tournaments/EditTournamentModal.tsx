import { useState } from "react";
import { X } from "lucide-react";
import { useUpdateTournament, useCloseTournamentRegistration } from "@/services/TournamentService";
import { DeleteTournamentConfirmationModal } from "./DeleteTournamentConfirmationModal";

interface EditTournamentModalProps {
  tournament: any;
  onClose: () => void;
  onSaved: () => void;
  onSuccessToast: (msg: string) => void;
}

export const EditTournamentModal = ({ tournament, onClose, onSaved, onSuccessToast }: EditTournamentModalProps) => {
  const [formData, setFormData] = useState({
    name: tournament.name || "",
    startDate: tournament.startDate || "",
    format: tournament.format || "",
    maxTeams: tournament.maxTeams || 0,
    endDate: tournament.endDate || "",
    description: tournament.description || "",
    prizes: tournament.prizes || "",
    registrationFee: tournament.registrationFee || 0,
  });
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateTournament, isPending } = useUpdateTournament();
  const { mutate: closeRegistration, isPending: isClosing } = useCloseTournamentRegistration();
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) return "El nombre es obligatorio";
    if (!formData.startDate) return "La fecha de inicio es obligatoria";
    if (!formData.endDate) return "La fecha de fin es obligatoria";
    if (!formData.format) return "El formato es obligatorio";
    if (!formData.maxTeams || formData.maxTeams < 2) return "El máximo de equipos debe ser al menos 2";
    if (formData.registrationFee < 0) return "La inscripción no puede ser negativa";
    if (formData.endDate < formData.startDate) return "La fecha de fin no puede ser anterior a la de inicio";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    updateTournament({ id: tournament.id, updates: {
      ...formData,
      maxTeams: Number(formData.maxTeams),
      registrationFee: Number(formData.registrationFee),
    } }, {
      onSuccess: () => {
        onSuccessToast("¡Torneo editado correctamente!");
        onSaved();
      },
      onError: (err: any) => {
        setError(err?.message || "Error al actualizar torneo");
      }
    });
  };

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflow: "auto",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          borderBottom: "1px solid #e5e7eb",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>Editar Torneo</h2>
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
        {tournament.state === "OPEN_TO_REGISTER" && (
          <button
            style={{
              margin: "24px 24px 0 24px",
              padding: "10px 18px",
              backgroundColor: "#f59e42",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "15px",
              cursor: isClosing ? "not-allowed" : "pointer",
              opacity: isClosing ? 0.7 : 1,
              width: "calc(100% - 48px)"
            }}
            disabled={isClosing}
            onClick={() => setShowCloseConfirmModal(true)}
          >
            {isClosing ? "Cerrando inscripción..." : "Cerrar inscripción"}
          </button>
        )}
        {showCloseConfirmModal && (
          <DeleteTournamentConfirmationModal
            tournamentName={tournament.name}
            isDeleting={isClosing}
            customText="¿Estás seguro de que quieres cerrar la inscripción? Esta acción no se puede deshacer."
            onClose={() => setShowCloseConfirmModal(false)}
            onConfirm={() => {
              closeRegistration(tournament.id, {
                onSuccess: () => {
                  setShowCloseConfirmModal(false);
                  onSuccessToast("¡Inscripción cerrada correctamente!");
                  onSaved();
                  window.location.reload();
                },
                onError: (err: any) => {
                  setError(err?.message || "Error al cerrar inscripción");
                }
              });
            }}
          />
        )}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label>Fecha de inicio</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label>Fecha de fin</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label>Formato</label>
            <select
              name="format"
              value={formData.format}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}
            >
              <option value="">Seleccionar formato</option>
              <option value="SINGLE_ELIMINATION">Single Elimination</option>
              <option value="GROUP_STAGE_AND_ELIMINATION">Group Stage And Elimination</option>
              <option value="ROUND_ROBIN">Round Robin</option>
            </select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label>Cantidad máxima de equipos</label>
            <input
              type="number"
              name="maxTeams"
              value={formData.maxTeams}
              onChange={handleChange}
              min={2}
              required
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}
            />
            <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Equipos registrados actualmente: {tournament.registeredTeams || 0} / {tournament.maxTeams || 0}
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label>Premios</label>
            <input
              type="text"
              name="prizes"
              value={formData.prizes}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label>Costo de inscripción</label>
            <input
              type="number"
              name="registrationFee"
              value={formData.registrationFee}
              onChange={handleChange}
              min={0}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)" }}
            />
          </div>
          {error && <div style={{ color: "#ef4444", marginBottom: "12px" }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "15px",
                cursor: isPending ? "not-allowed" : "pointer"
              }}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 18px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "15px",
                cursor: isPending ? "not-allowed" : "pointer"
              }}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 