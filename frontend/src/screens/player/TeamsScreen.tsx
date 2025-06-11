import { useUserTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, useInviteToTeam, usePendingInvitations } from "@/services/TeamServices";
import { navigate } from "wouter/use-browser-location";
import { useState, useRef } from "react";
import { Plus, Edit, Trash2, X, Upload, Users, Crown } from "lucide-react";
import type { Team } from "@/models/Team";
import { useQueryClient } from "@tanstack/react-query";
import { useToken } from "@/services/TokenContext";
import { uploadTeamLogo } from "@/services/supabaseClient";

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

  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();
  const inviteToTeamMutation = useInviteToTeam();
  const queryClient = useQueryClient();
  const [token] = useToken();
  const userEmail = token.state === "LOGGED_IN" ? token.email : null;

  const handleCreateTeam = async (teamData: { name: string; logo?: string; primaryColor: string; secondaryColor: string }) => {
    try {
      await createTeamMutation.mutateAsync(teamData);
      setErrorMessage(null);
      setShowCreateModal(false);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setErrorMessage(errorMessage);
    }
  };

  const handleEditTeam = async (teamData: { name: string; logo?: string; primaryColor: string; secondaryColor: string }) => {
    if (!selectedTeam) return;
    try {
      await updateTeamMutation.mutateAsync({ teamId: selectedTeam.id, updates: teamData });
      setErrorMessage(null);
      setShowEditModal(false);
      setSelectedTeam(null);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setErrorMessage(errorMessage);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeamMutation.mutateAsync(teamId);
      setTeamToDeleteId(null);
      setShowDeleteModal(false);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setErrorMessage(errorMessage);
    }
  };

  const getErrorMessage = (error: any) => {
    const message = error?.message || "Ocurrió un error desconocido";
    
    // Manejar errores específicos del backend
    if (message.includes("Team name already exists")) {
      return "Este nombre de equipo ya está en uso";
    }
    // Error genérico para cualquier otro caso
    return "Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.";
  };

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
          <div
            key={team.id}
            onClick={() => {
              setSelectedTeamForDetails(team);
              setShowDetailsModal(true);
            }}
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
            {/* Cantidad de miembros */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--muted-foreground)", fontSize: "1rem" }}>
              <Users size={18} />
              <span>{(team.members?.length || 0)} {((team.members?.length || 0) === 1 ? 'miembro' : 'miembros')}</span>
            </div>
            {/* Action buttons - Only show if user is the owner */}
            {team.ownerId === userEmail && (
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
                    setSelectedTeam(team);
                    setShowEditModal(true);
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
                    setTeamToDeleteId(team.id);
                    setShowDeleteModal(true);
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
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTeamModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateTeam} />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTeam && (
        <EditTeamModal
          team={selectedTeam}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeam(null);
          }}
          onSubmit={handleEditTeam}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && teamToDeleteId && (
        <DeleteConfirmationModal
          teamId={teamToDeleteId}
          teamName={teams?.find(t => t.id === teamToDeleteId)?.name || 'este equipo'}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteTeam}
        />
      )}

      {/* Error Popup */}
      {errorMessage && (
        <ErrorPopup message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      {/* Team Details Modal */}
      {showDetailsModal && selectedTeamForDetails && (
        <TeamDetailsModal
          team={selectedTeamForDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTeamForDetails(null);
          }}
        />
      )}
    </div>
  );
};

// Create Team Modal Component
const CreateTeamModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (team: { name: string; logo?: string; primaryColor: string; secondaryColor: string }) => void;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    primaryColor: "#ff0000",
    secondaryColor: "#ffffff"
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("La imagen no debe superar los 2MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const logoUrl = await uploadTeamLogo(file, formData.name);
      setFormData({ ...formData, logo: logoUrl });
    } catch (error) {
      setUploadError("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ ...formData, logo: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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
              Crear Equipo
            </h2>
            <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "14px" }}>
              Completa la información para crear un nuevo equipo
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

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}>
              Nombre del Equipo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}>
              Logo del Equipo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div
              onClick={handleButtonClick}
              style={{
                border: "2px dashed var(--border)",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: formData.logo ? "transparent" : "var(--secondary)",
                transition: "all 0.2s ease",
                position: "relative",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              {formData.logo ? (
                <>
                  <img
                    src={formData.logo}
                    alt="Logo Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "4px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    onClick={handleRemovePhoto}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                    }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={32} color="var(--muted-foreground)" />
                  <div style={{ color: "var(--muted-foreground)" }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "500" }}>
                      Haz clic para subir una imagen
                    </p>
                    <p style={{ margin: 0, fontSize: "12px" }}>
                      PNG, JPG o GIF (max. 2MB)
                    </p>
                  </div>
                </>
              )}
            </div>
            {uploadError && (
              <p style={{ color: "var(--destructive)", fontSize: "12px", marginTop: "4px" }}>{uploadError}</p>
            )}
            {isUploading && (
              <p style={{ color: "var(--primary)", fontSize: "12px", marginTop: "4px" }}>Subiendo imagen...</p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}>
              Colores del Equipo
            </label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                }}>
                  Color Principal
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      primaryColor: e.target.value 
                    })}
                    style={{
                      width: "50px",
                      height: "40px",
                      padding: "0",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={formData.primaryColor.toUpperCase()}
                    onChange={(e) => {
                      const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      setFormData({ 
                        ...formData, 
                        primaryColor: color 
                      });
                    }}
                    placeholder="#FF0000"
                    style={{
                      width: "100px",
                      padding: "8px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                }}>
                  Color Secundario
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      secondaryColor: e.target.value 
                    })}
                    style={{
                      width: "50px",
                      height: "40px",
                      padding: "0",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor.toUpperCase()}
                    onChange={(e) => {
                      const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      setFormData({ 
                        ...formData, 
                        secondaryColor: color 
                      });
                    }}
                    placeholder="#FFFFFF"
                    style={{
                      width: "100px",
                      padding: "8px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Crear Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Team Modal Component
const EditTeamModal = ({
  team,
  onClose,
  onSubmit,
}: {
  team: Team;
  onClose: () => void;
  onSubmit: (team: { name: string; logo?: string; primaryColor: string; secondaryColor: string }) => void;
}) => {
  const [formData, setFormData] = useState({
    name: team.name,
    logo: team.logo || "",
    primaryColor: team.colors?.[0]?.startsWith('#') ? team.colors[0] : `#${team.colors?.[0]}` || "#ff0000",
    secondaryColor: team.colors?.[1]?.startsWith('#') ? team.colors[1] : `#${team.colors?.[1]}` || "#ffffff"
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError("El archivo debe ser una imagen");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("La imagen no debe superar los 2MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const logoUrl = await uploadTeamLogo(file, formData.name);
      setFormData({ ...formData, logo: logoUrl });
    } catch (error) {
      setUploadError("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ ...formData, logo: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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
              Editar Equipo
            </h2>
            <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "14px" }}>
              Completa la información para actualizar el equipo
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

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}>
              Nombre del Equipo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}>
              Logo del Equipo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div
              onClick={handleButtonClick}
              style={{
                border: "2px dashed var(--border)",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: formData.logo ? "transparent" : "var(--secondary)",
                transition: "all 0.2s ease",
                position: "relative",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              {formData.logo ? (
                <>
                  <img
                    src={formData.logo}
                    alt="Logo Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "4px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    onClick={handleRemovePhoto}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                    }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={32} color="var(--muted-foreground)" />
                  <div style={{ color: "var(--muted-foreground)" }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "500" }}>
                      Haz clic para subir una imagen
                    </p>
                    <p style={{ margin: 0, fontSize: "12px" }}>
                      PNG, JPG o GIF (max. 2MB)
                    </p>
                  </div>
                </>
              )}
            </div>
            {uploadError && (
              <p style={{ color: "var(--destructive)", fontSize: "12px", marginTop: "4px" }}>{uploadError}</p>
            )}
            {isUploading && (
              <p style={{ color: "var(--primary)", fontSize: "12px", marginTop: "4px" }}>Subiendo imagen...</p>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}>
              Colores del Equipo
            </label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                }}>
                  Color Principal
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      primaryColor: e.target.value 
                    })}
                    style={{
                      width: "50px",
                      height: "40px",
                      padding: "0",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={formData.primaryColor.toUpperCase()}
                    onChange={(e) => {
                      const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      setFormData({ 
                        ...formData, 
                        primaryColor: color 
                      });
                    }}
                    placeholder="#FF0000"
                    style={{
                      width: "100px",
                      padding: "8px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                }}>
                  Color Secundario
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      secondaryColor: e.target.value 
                    })}
                    style={{
                      width: "50px",
                      height: "40px",
                      padding: "0",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor.toUpperCase()}
                    onChange={(e) => {
                      const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      setFormData({ 
                        ...formData, 
                        secondaryColor: color 
                      });
                    }}
                    placeholder="#FFFFFF"
                    style={{
                      width: "100px",
                      padding: "8px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Actualizar Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  teamId,
  teamName,
  onClose,
  onConfirm,
}: {
  teamId: string;
  teamName: string;
  onClose: () => void;
  onConfirm: (teamId: string) => void;
}) => {
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
            onClick={() => onConfirm(teamId)}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--destructive)",
              color: "var(--destructive-foreground)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

// Error Popup Component
const ErrorPopup = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
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
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: "var(--destructive)",
          color: "var(--destructive-foreground)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
              Error
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "4px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "currentColor",
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <p style={{ margin: 0, color: "var(--foreground)", fontSize: "14px" }}>
            {message}
          </p>
        </div>
        <div style={{ 
          padding: "12px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "flex-end"
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Team Details Modal Component
const TeamDetailsModal = ({
  team,
  onClose,
}: {
  team: Team;
  onClose: () => void;
}) => {
  const [token] = useToken();
  const userEmail = token.state === "LOGGED_IN" ? token.email : null;
  const isOwner = userEmail === team.ownerId;
  const inviteToTeamMutation = useInviteToTeam();
  const [inviteInputs, setInviteInputs] = useState(["", "", "", ""]);
  const [inviteFeedback, setInviteFeedback] = useState<(string|null)[]>([null, null, null, null]);
  const { data: pendingInvitations = [], refetch: refetchPendingInvitations } = usePendingInvitations(team.id);

  // Construir los slots: owner + hasta 4 miembros
  const slots: string[] = [team.ownerId, ...(team.members?.filter(m => m !== team.ownerId) || [])];
  while (slots.length < 5) slots.push("");

  const handleInvite = async (index: number) => {
    const email = inviteInputs[index-1];
    if (!email) return;
    try {
      await inviteToTeamMutation.mutateAsync({ teamId: team.id, inviteeEmail: email });
      setInviteFeedback(fb => fb.map((f, i) => i === index-1 ? "Invitación enviada" : f));
      setInviteInputs(inputs => inputs.map((v, i) => i === index-1 ? "" : v));
      // Refetch pending invitations after successful invite
      refetchPendingInvitations();
    } catch (e: any) {
      setInviteFeedback(fb => fb.map((f, i) => i === index-1 ? (e?.message || "Error al invitar") : f));
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
                    <span>{member}</span>
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
                        disabled={inviteToTeamMutation.status === 'pending'}
                      >
                        Invitar
                      </button>
                      {inviteFeedback[idx-1] && (
                        <span style={{ marginLeft: 8, color: inviteFeedback[idx-1] === "Invitación enviada" ? "green" : "red" }}>{inviteFeedback[idx-1]}</span>
                      )}
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
      </div>
    </div>
  );
}; 