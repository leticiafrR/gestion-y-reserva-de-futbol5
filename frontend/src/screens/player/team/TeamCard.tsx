import { Edit, Trash2, Users } from "lucide-react";
import type { Team } from "@/models/Team";

interface TeamCardProps {
  team: Team;
  userEmail: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onDetails: () => void;
}

export const TeamCard = ({ team, userEmail, onEdit, onDelete, onDetails }: TeamCardProps) => {
  const isOwner = userEmail === team.ownerId;

  return (
    <div
      onClick={onDetails}
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem",
        width: "320px",
        background: "var(--card)",
        boxShadow: "0 2px 8px var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px var(--border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 2px 8px var(--border)";
      }}
    >
      <img
        src={team.logo}
        alt={team.name}
        style={{
          width: "120px",
          height: "120px",
          objectFit: "cover",
          borderRadius: "50%",
          marginBottom: "1rem",
          boxShadow: "0 1px 4px var(--border)"
        }}
      />
      <h2 style={{ margin: "0.5rem 0", color: "var(--primary)", fontSize: "1.5rem", textAlign: "center" }}>
        {team.name}
      </h2>
      <div style={{ 
        display: "flex", 
        gap: "0.5rem", 
        marginBottom: "1rem" 
      }}>
        {team.colors?.map((color, index) => (
          <div
            key={index}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: color,
              border: "1px solid var(--border)"
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--muted-foreground)", fontSize: "1rem" }}>
        <Users size={18} />
        <span>{(team.members?.length || 0)} {((team.members?.length || 0) === 1 ? 'miembro' : 'miembros')}</span>
      </div>
      {isOwner && (
        <div style={{ 
          display: "flex", 
          gap: "0.5rem",
          marginTop: "1rem",
          width: "100%",
          justifyContent: "center"
        }}>
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Edit size={14} />
            Editar
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--destructive)",
              color: "var(--destructive-foreground)",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}; 