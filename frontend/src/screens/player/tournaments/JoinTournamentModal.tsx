import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUserTeams } from "@/services/TeamServices";
import { useRegisterTeamToTournament } from "@/services/TournamentService";
import { useLocation } from "wouter";

interface JoinTournamentModalProps {
  tournament: any;
  onClose: () => void;
  onErrorToast?: (message: string) => void;
}

export const JoinTournamentModal = ({ tournament, onClose, onErrorToast }: JoinTournamentModalProps) => {
  const { data: teams, isLoading: isLoadingTeams } = useUserTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const { mutate: registerTeam, isPending, isSuccess, isError, error } = useRegisterTeamToTournament();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isError && error) {
      // Loguear el error completo en consola para debug
      // eslint-disable-next-line no-console
      console.log('Error al unir equipo al torneo:', error);
      
      // Manejar errores específicos
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('Team already registered') || errorMessage.includes('409')) {
        const toastMessage = "Tu equipo ya está registrado en este torneo";
        if (onErrorToast) {
          onErrorToast(toastMessage);
        } else {
          // Fallback si no hay función de toast
          alert(toastMessage);
        }
      } else if (errorMessage.includes('Tournament is full')) {
        const toastMessage = "El torneo está completo, no se pueden registrar más equipos";
        if (onErrorToast) {
          onErrorToast(toastMessage);
        } else {
          alert(toastMessage);
        }
      } else if (errorMessage.includes('not the captain')) {
        const toastMessage = "Solo el capitán del equipo puede registrarlo en un torneo";
        if (onErrorToast) {
          onErrorToast(toastMessage);
        } else {
          alert(toastMessage);
        }
      } else {
        // Error genérico
        const toastMessage = `Error al unirse al torneo: ${errorMessage}`;
        if (onErrorToast) {
          onErrorToast(toastMessage);
        } else {
          alert(toastMessage);
        }
      }
    }
  }, [isError, error, onErrorToast]);

  const handleJoin = () => {
    if (!selectedTeamId) return;
    registerTeam({ teamId: selectedTeamId, tournamentId: tournament.id }, {
      onSuccess: () => {
        setSuccessMsg("¡Equipo unido al torneo exitosamente!");
        setTimeout(() => onClose(), 1500);
      }
    });
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "white", borderRadius: 12, maxWidth: 500, width: "100%", padding: 32, boxShadow: "0 2px 12px #0002", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}><X size={24} /></button>
        <h2 style={{ marginBottom: 12, fontSize: 22, fontWeight: 700 }}>{tournament.name}</h2>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Formato:</b> {tournament.format}</div>
          <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Desde:</b> {tournament.startDate || "-"}</div>
          <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Hasta:</b> {tournament.endDate || "-"}</div>
          <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Equipos registrados:</b> {tournament.registeredTeams ?? 0} / {tournament.maxTeams ?? "-"}</div>
          {tournament.description && <div style={{ color: "#374151", fontSize: 16, marginBottom: 8 }}><b>Descripción:</b> {tournament.description}</div>}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, display: "block" }}>Selecciona tu equipo</label>
          {isLoadingTeams ? (
            <div>Cargando equipos...</div>
          ) : teams && teams.length > 0 ? (
            <select
              value={selectedTeamId || ""}
              onChange={e => setSelectedTeamId(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}
            >
              <option value="">Seleccionar equipo</option>
              {teams.map((team: any) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          ) : (
            <div style={{ color: "#ef4444" }}>No tienes equipos disponibles para unirte.</div>
          )}
        </div>
        {successMsg && <div style={{ color: "#10b981", marginBottom: 12 }}>{successMsg}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 18px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleJoin}
            disabled={!selectedTeamId || isPending || (teams && teams.length === 0)}
            style={{ padding: "10px 18px", background: "#10b981", color: "white", border: "none", borderRadius: 6, cursor: !selectedTeamId || isPending ? "not-allowed" : "pointer", opacity: !selectedTeamId || isPending ? 0.7 : 1, fontSize: 15 }}
          >
            {isPending ? "Uniendo..." : "Unirme al torneo"}
          </button>
        </div>
      </div>
    </div>
  );
}; 