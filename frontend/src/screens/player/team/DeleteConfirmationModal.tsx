import { X } from "lucide-react";
import { useDeleteTeam } from "@/services/TeamServices";

interface DeleteConfirmationModalProps {
  teamId: string;
  teamName: string;
  onClose: () => void;
  onError: (message: string) => void;
}

export const DeleteConfirmationModal = ({
  teamId,
  teamName,
  onClose,
  onError,
}: DeleteConfirmationModalProps) => {
  const deleteTeamMutation = useDeleteTeam();

  const handleDelete = async () => {
    try {
      await deleteTeamMutation.mutateAsync(teamId);
      onClose();
    } catch (error: any) {
      onError(error?.message || "Error al eliminar el equipo");
    }
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
        borderRadius: "8px",
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
          borderBottom: "1px solid var(--border)",
        }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0" }}>
              Confirmar Eliminación
            </h2>
            <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "14px" }}>
              ¿Estás seguro de que quieres eliminar el equipo "{teamName}"?
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", padding: "24px" }}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteTeamMutation.isPending}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--destructive)",
              color: "var(--destructive-foreground)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              opacity: deleteTeamMutation.isPending ? 0.7 : 1,
            }}
          >
            {deleteTeamMutation.isPending ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}; 