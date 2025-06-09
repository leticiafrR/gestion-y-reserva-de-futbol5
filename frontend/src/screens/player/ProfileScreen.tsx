import { useProfile } from "@/services/ProfileServices";
import { navigate } from "wouter/use-browser-location";
import { useState } from "react";
import { X } from "lucide-react";

export const ProfileScreen = () => {
  const { data: profile, isLoading, error } = useProfile();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando perfil...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>Error al cargar el perfil.</div>;

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: 800, 
      margin: "0 auto",
      backgroundColor: "var(--background)",
      minHeight: "100vh"
    }}>
      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ color: "var(--foreground)", margin: 0, fontSize: "2rem" }}>Mi Perfil</h1>
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
          onClick={() => navigate("/main")}
        >
          Volver a Inicio
        </button>
      </div>

      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
        padding: "2rem",
        backgroundColor: "var(--card)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 2px 8px var(--border)"
      }}>
        <div style={{ 
          position: "relative",
          width: "150px",
          height: "150px"
        }}>
          <img
            src={profile?.photo}
            alt={`${profile?.name} ${profile?.lastName}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
              border: "4px solid var(--primary)"
            }}
          />
        </div>

        <div style={{ 
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <ProfileField label="Nombre" value={profile ? `${profile.name} ${profile.lastName}` : ''} />
          <ProfileField label="Email" value={profile?.email || ''} />
          <ProfileField label="Edad" value={profile ? `${profile.age} años` : ''} />
          <ProfileField label="Género" value={profile?.gender === 'male' ? 'Masculino' : profile?.gender === 'female' ? 'Femenino' : 'Otro'} />
          <ProfileField label="Tipo de usuario" value={profile?.userType === 'user' ? 'Jugador' : 'Administrador de cancha'} />
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div style={{ 
    display: "flex", 
    justifyContent: "space-between",
    padding: "0.75rem",
    borderBottom: "1px solid var(--border)"
  }}>
    <span style={{ color: "var(--muted-foreground)" }}>{label}:</span>
    <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{value}</span>
  </div>
);

const ErrorPopup = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div
    style={{
      position: "fixed",
      top: "1rem",
      right: "1rem",
      backgroundColor: "var(--destructive)",
      color: "white",
      padding: "1rem",
      borderRadius: "var(--radius)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    }}
  >
    <span>{message}</span>
    <button
      onClick={onClose}
      style={{
        background: "none",
        border: "none",
        color: "white",
        cursor: "pointer",
        padding: "0.25rem",
      }}
    >
      <X size={16} />
    </button>
  </div>
);
