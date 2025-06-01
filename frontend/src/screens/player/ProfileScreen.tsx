import { useProfile, useUpdateProfile } from "@/services/ProfileServices";
import { navigate } from "wouter/use-browser-location";
import { useState } from "react";
import type { User } from "@/models/User";
import { X } from "lucide-react";

export const ProfileScreen = () => {
  const { data: profile, isLoading, error } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando perfil...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>Error al cargar el perfil.</div>;

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: 1200, 
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
          onClick={() => {
            navigate("/main");
          }}
        >
          Volver a Inicio
        </button>
      </div>

      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        padding: "2rem" 
      }}>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            width: "100%",
            maxWidth: "500px",
            background: "var(--card)",
            boxShadow: "0 2px 8px var(--border)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "170px",
              height: "170px",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                border: "2px solid var(--primary)",
                animation: "rotate 10s linear infinite",
              }}
            />
            <img
              src={profile?.photo}
              alt={`${profile?.name} ${profile?.lastName}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "50%",
                boxShadow: "0 1px 4px var(--border)",
                border: "4px solid var(--background)"
              }}
            />
          </div>
          <style>
            {`
              @keyframes rotate {
                from {
                  transform: translate(-50%, -50%) rotate(0deg);
                }
                to {
                  transform: translate(-50%, -50%) rotate(360deg);
                }
              }
            `}
          </style>

          <h2 style={{ 
            margin: "0.5rem 0", 
            color: "var(--primary)", 
            fontSize: "1.8rem", 
            textAlign: "center" 
          }}>
            {profile?.name} {profile?.lastName}
          </h2>
          
          <div style={{ 
            width: "100%", 
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              padding: "0.5rem 0",
              borderBottom: "1px solid var(--border)"
            }}>
              <span style={{ color: "var(--muted-foreground)" }}>Email:</span>
              <span style={{ color: "var(--foreground)" }}>{profile?.email}</span>
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              padding: "0.5rem 0",
              borderBottom: "1px solid var(--border)"
            }}>
              <span style={{ color: "var(--muted-foreground)" }}>Edad:</span>
              <span style={{ color: "var(--foreground)" }}>{profile?.age} años</span>
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              padding: "0.5rem 0",
              borderBottom: "1px solid var(--border)"
            }}>
              <span style={{ color: "var(--muted-foreground)" }}>Género:</span>
              <span style={{ color: "var(--foreground)" }}>
                {profile?.gender === 'male' ? 'Masculino' : 'Femenino'}
              </span>
            </div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              padding: "0.5rem 0",
              borderBottom: "1px solid var(--border)"
            }}>
              <span style={{ color: "var(--muted-foreground)" }}>Tipo de usuario:</span>
              <span style={{ color: "var(--foreground)" }}>
                {profile?.userType === 'player' ? 'Jugador' : 'Administrador'}
              </span>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                alignSelf: "flex-end"
              }}
            >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile!}
          onClose={() => setShowEditModal(false)}
          onError={(message) => setErrorMessage(message)}
        />
      )}
    </div>
  );
};

const EditProfileModal = ({
  profile,
  onClose,
  onError,
}: {
  profile: User;
  onClose: () => void;
  onError: (message: string) => void;
}) => {
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState({
    name: profile.name,
    lastName: profile.lastName,
    email: profile.email,
    photo: profile.photo,
    age: profile.age,
    gender: profile.gender,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      onError(error.message || 'Error al actualizar el perfil');
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--background)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "var(--muted-foreground)",
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ 
          marginTop: 0, 
          marginBottom: "1.5rem", 
          color: "var(--foreground)",
          fontSize: "1.5rem",
        }}>
          Editar Perfil
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "var(--muted-foreground)", display: "block", marginBottom: "0.5rem" }}>
              URL de la foto:
            </label>
            <input
              type="text"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "var(--muted-foreground)", display: "block", marginBottom: "0.5rem" }}>
              Nombre:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "var(--muted-foreground)", display: "block", marginBottom: "0.5rem" }}>
              Apellido:
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "var(--muted-foreground)", display: "block", marginBottom: "0.5rem" }}>
              Email:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "var(--muted-foreground)", display: "block", marginBottom: "0.5rem" }}>
              Edad:
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)"
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ color: "var(--muted-foreground)", display: "block", marginBottom: "0.5rem" }}>
              Género:
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" })}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)"
              }}
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer"
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer"
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ErrorPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
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
};
