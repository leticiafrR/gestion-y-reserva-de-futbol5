import { useState } from "react";
import { X, Users, Crown } from "lucide-react";
import { useInviteToTeam, usePendingInvitations, useRemoveTeamMember } from "@/services/TeamServices";
import { useToken } from "@/services/TokenContext";
import type { Team } from "@/models/Team";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface TeamDetailsModalProps {
  team: Team;
  onClose: () => void;
  onError: (message: string) => void;
}

export const TeamDetailsModal = ({ team, onClose, onError }: TeamDetailsModalProps) => {
  const [token] = useToken();
  const userEmail = token.state === "LOGGED_IN" ? token.email : null;
  const isOwner = userEmail === team.ownerId;
  const inviteToTeamMutation = useInviteToTeam();
  const removeMemberMutation = useRemoveTeamMember();
  const [inviteInputs, setInviteInputs] = useState(["", "", "", ""]);
  const { data: pendingInvitations = [], refetch: refetchPendingInvitations } = usePendingInvitations(team.id);
  const [showRemoveModal, setShowRemoveModal] = useState<{ username: string, type: 'remove' | 'leave' } | null>(null);

  // Construir los slots: owner + hasta 4 miembros
  const slots: string[] = [team.ownerId, ...(team.members?.filter(m => m !== team.ownerId) || [])];
  while (slots.length < 5) slots.push("");

  const handleInvite = async (index: number) => {
    const email = inviteInputs[index - 1];
    if (!email) return;
    try {
      await inviteToTeamMutation.mutateAsync({ teamId: team.id, inviteeEmail: email });
      // Crear y mostrar el toast de éxito
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.backgroundColor = '#22c55e';
      toast.style.color = 'white';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      toast.style.zIndex = '2000';
      toast.style.fontSize = '16px';
      toast.style.fontWeight = '500';
      toast.textContent = 'Invitación enviada';
      document.body.appendChild(toast);

      // Limpiar el input
      setInviteInputs(inputs => inputs.map((v, i) => i === index - 1 ? "" : v));
      refetchPendingInvitations();

      // Remover el toast después de 3 segundos
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    } catch (e: any) {
      // Crear y mostrar el toast de error
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.backgroundColor = '#ef4444';
      toast.style.color = 'white';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      toast.style.zIndex = '2000';
      toast.style.fontSize = '16px';
      toast.style.fontWeight = '500';
      
      let errorMsg = "Error al invitar";
      if (e?.response?.data?.message?.includes("not found") || e?.message?.includes("not found")) {
        errorMsg = "Usuario no encontrado";
      }
      toast.textContent = errorMsg;
      document.body.appendChild(toast);

      // Remover el toast después de 3 segundos
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    }
  };

  // Handler para eliminar miembro (owner elimina a otro)
  const handleRemoveMember = (username: string) => {
    setShowRemoveModal({ username, type: 'remove' });
  };

  // Handler para salir del equipo (usuario actual)
  const handleLeaveTeam = () => {
    setShowRemoveModal({ username: userEmail!, type: 'leave' });
  };

  // Confirmación de borrado
  const confirmRemove = async () => {
    if (!showRemoveModal) return;
    try {
      await removeMemberMutation.mutateAsync({ teamId: team.id, deletingUsername: showRemoveModal.username });
      setShowRemoveModal(null);
      onClose(); // Cierra el modal de detalles para refrescar la pantalla
    } catch (error: any) {
      onError(error?.message || (showRemoveModal.type === 'leave' ? 'Error al salir del equipo' : 'Error al eliminar miembro'));
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "8px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0" }}>Detalles del Equipo</h2>
            <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "14px" }}>Información del equipo {team.name}</p>
          </div>
          <button onClick={onClose} style={{ padding: "8px", backgroundColor: "transparent", border: "none", cursor: "pointer", borderRadius: "4px" }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "24px" }}>
          {/* Logo */}
          {team.logo && (
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <img
                src={team.logo}
                alt={team.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  boxShadow: "0 2px 8px var(--border)"
                }}
              />
            </div>
          )}

          {/* Colores */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>
              Colores del Equipo
            </h3>
            <div style={{ display: "flex", gap: "12px" }}>
              {team.colors?.map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: color,
                    border: "1px solid var(--border)"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Slots de miembros */}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>Miembros del Equipo</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {slots.map((member, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--secondary)", borderRadius: "8px", padding: "10px 16px" }}>
                  <Users size={16} />
                  {idx === 0 ? (
                    <>
                      <Crown size={18} color="#FFD700" style={{ marginRight: 3, verticalAlign: "middle" }} />
                      <span>{member}</span>
                    </>
                  ) : member ? (
                    <>
                      <span>{member}</span>
                      {/* Si es owner y no es el mismo, puede eliminar */}
                      {isOwner && member !== userEmail && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          style={{ marginLeft: "auto", padding: "4px 10px", backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                          disabled={removeMemberMutation.isPending}
                        >
                          {removeMemberMutation.isPending ? "Eliminando..." : "Eliminar"}
                        </button>
                      )}
                    </>
                  ) : isOwner ? (
                    <>
                      <input
                        type="email"
                        placeholder="Invitar por email"
                        value={inviteInputs[idx-1]}
                        onChange={e => setInviteInputs(inputs => inputs.map((v, i) => i === idx-1 ? e.target.value : v))}
                        style={{ flex: 1, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "4px" }}
                      />
                      <button
                        onClick={() => handleInvite(idx)}
                        style={{ padding: "6px 12px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
                        disabled={inviteToTeamMutation.isPending}
                      >
                        Invitar
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "var(--muted-foreground)" }}>Vacío</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invitaciones Pendientes */}
          {isOwner && pendingInvitations.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>Invitaciones Pendientes</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {pendingInvitations.map((email, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px", 
                      background: "var(--secondary)", 
                      borderRadius: "8px", 
                      padding: "8px 12px",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <Users size={16} />
                    <span style={{ flex: 1 }}>{email}</span>
                    <span style={{ 
                      fontSize: "12px", 
                      color: "var(--muted-foreground)",
                      backgroundColor: "var(--background)",
                      padding: "2px 8px",
                      borderRadius: "4px"
                    }}>
                      Pendiente
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}>Cerrar</button>
        </div>
        {/* Botón para salir del equipo si no es owner */}
        {!isOwner && userEmail && team.members?.includes(userEmail) && (
          <div style={{ padding: "0 24px 16px 24px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleLeaveTeam}
              style={{ padding: "8px 16px", backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? "Saliendo..." : "Salir del equipo"}
            </button>
          </div>
        )}
        {showRemoveModal && (
          <DeleteConfirmationModal
            teamId={team.id}
            teamName={showRemoveModal.type === 'leave' ? 'el equipo' : showRemoveModal.username}
            onClose={() => setShowRemoveModal(null)}
            onError={onError}
            // Usar el texto adecuado y el handler correcto
            customText={showRemoveModal.type === 'leave' ? '¿Estás seguro de que quieres salir del equipo?' : `¿Estás seguro de que quieres eliminar a ${showRemoveModal.username} del equipo?`}
            onConfirm={confirmRemove}
          />
        )}
      </div>
    </div>
  );
}; 