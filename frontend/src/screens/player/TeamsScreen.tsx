import { useUserTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, useLeaveMemberTeam } from "@/services/TeamServices";
import { navigate } from "wouter/use-browser-location";
import { useState } from "react";
import { Plus, Edit, Trash2, X, Crown, UserPlus, LogOut } from "lucide-react";
import type { Team } from "@/models/Team";
import { useQueryClient } from "@tanstack/react-query";

export const TeamsScreen = () => {
  const { data: teams, isLoading, error } = useUserTeams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDeleteId, setTeamToDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();
  // @ts-expect-error
  const leaveMemberTeamMutation = useLeaveMemberTeam();
  // @ts-expect-error
  const queryClient = useQueryClient();

  const handleCreateTeam = async (teamData: Omit<Team, "id" | "ownerId" | "members">) => {
    try {
      await createTeamMutation.mutateAsync(teamData);
      setErrorMessage(null);
      setShowCreateModal(false);
    } catch (error: any) {
      setErrorMessage(error.message || "Error al crear el equipo");
    }
  };

  const handleEditTeam = async (teamData: Omit<Team, "id" | "ownerId" | "members">) => {
    if (!selectedTeam) return;
    try {
      await updateTeamMutation.mutateAsync({ teamId: selectedTeam.id, updates: teamData });
      setErrorMessage(null);
      setShowEditModal(false);
      setSelectedTeam(null);
    } catch (error: any) {
      setErrorMessage(error.message || "Error al actualizar el equipo");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeamMutation.mutateAsync(teamId);
      setTeamToDeleteId(null);
      setShowDeleteModal(false);
    } catch (error: any) {
      setErrorMessage(error.message || "Error al eliminar el equipo");
    }
  };

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando equipos...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>Error al cargar los equipos.</div>;

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: 1200, 
      margin: "0 auto",
      backgroundColor: "var(--background)",
      minHeight: "100vh"
    }}>
      {errorMessage && (
        <ErrorPopup message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ color: "var(--foreground)", margin: 0, fontSize: "2rem" }}>Mis Equipos</h1>
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
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onClick={() => {
              setSelectedTeam(team);
              setShowMembersModal(true);
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
            <p style={{ 
              margin: "0.2rem 0", 
              color: "var(--muted-foreground)",
              fontSize: "0.9rem"
            }}>
              Ranking: #{team.ranking}
            </p>

            {/* Action buttons */}
            <div style={{ 
              display: "flex", 
              gap: "0.5rem",
              marginTop: "1rem",
              width: "100%",
              justifyContent: "center"
            }}
            onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking buttons
            >
              {team.ownerId === "user1" && (
                <>
                  <button
                    onClick={() => {
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
                    onClick={() => {
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
                </>
              )}
            </div>
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

      {/* Members Modal */}
      {showMembersModal && selectedTeam && (
        <TeamMembersModal
          team={selectedTeam}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedTeam(null);
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
  onSubmit: (team: Omit<Team, "id" | "ownerId" | "members">) => void;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    colors: ["#ff0000", "#ffffff"],
    ranking: 1,
  });

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
              URL del Logo
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://..."
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
                    value={formData.colors[0]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      colors: [e.target.value, formData.colors[1]] 
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
                    value={formData.colors[0].toUpperCase()}
                    onChange={(e) => {
                      const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      setFormData({ 
                        ...formData, 
                        colors: [color, formData.colors[1]] 
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
                    value={formData.colors[1]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      colors: [formData.colors[0], e.target.value] 
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
                    value={formData.colors[1].toUpperCase()}
                    onChange={(e) => {
                      const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      setFormData({ 
                        ...formData, 
                        colors: [formData.colors[0], color] 
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
  onSubmit: (team: Omit<Team, "id" | "ownerId" | "members">) => void;
}) => {
  const [formData, setFormData] = useState({
    name: team.name,
    logo: team.logo || "",
    colors: team.colors || ["#ff0000", "#ffffff"],
    ranking: team.ranking || 1,
  });

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
              Modifica la información del equipo
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
              URL del Logo
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://..."
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
                    value={formData.colors[0]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      colors: [e.target.value, formData.colors[1]] 
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
                    value={formData.colors[0].toUpperCase()}
                    onChange={(e) => {
                      const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      setFormData({ 
                        ...formData, 
                        colors: [color, formData.colors[1]] 
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
                    value={formData.colors[1]}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      colors: [formData.colors[0], e.target.value] 
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
                    value={formData.colors[1].toUpperCase()}
                    onChange={(e) => {
                      const color = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      setFormData({ 
                        ...formData, 
                        colors: [formData.colors[0], color] 
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
              Guardar Cambios
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

        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
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
              Cancelar
            </button>
            <button
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
    </div>
  );
};

// Error Popup Component
const ErrorPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: "var(--destructive)",
      color: "var(--destructive-foreground)",
      padding: "16px 24px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      maxWidth: "400px",
    }}>
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--destructive-foreground)",
          cursor: "pointer",
          padding: "4px",
        }}
      >
        <X size={20} />
      </button>
    </div>
  );
};

// Team Members Modal Component
const TeamMembersModal = ({
  team,
  onClose,
}: {
  team: Team;
  onClose: () => void;
}) => {
  const isOwner = team.ownerId === "user1"; // Replace with actual user ID check
  const maxMembers = 5;
  const currentMembers = [team.ownerId, ...team.members];
  const remainingSlots = maxMembers - currentMembers.length;
  const leaveMemberTeamMutation = useLeaveMemberTeam();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleLeaveTeam = async () => {
    try {
      await leaveMemberTeamMutation.mutateAsync(team.id);
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "Error al abandonar el equipo");
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
      {errorMessage && (
        <ErrorPopup message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
      <div style={{
        backgroundColor: "var(--background)",
        borderRadius: "var(--radius-lg)",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 4px 12px var(--border)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0", color: "var(--foreground)" }}>
              Miembros del Equipo
            </h2>
            <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "14px" }}>
              {team.name} - {currentMembers.length} de {maxMembers} miembros
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "var(--radius)",
              color: "var(--muted-foreground)",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Owner slot with crown */}
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              backgroundColor: "var(--card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                color: "var(--primary-foreground)",
              }}>
                U
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  color: "var(--foreground)",
                }}>
                  <span>Usuario {team.ownerId}</span>
                  <Crown size={16} style={{ color: "gold" }} />
                </div>
                <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>Capitán</span>
              </div>
            </div>

            {/* Member slots */}
            {team.members.map((memberId) => (
              <div key={memberId} style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                backgroundColor: "var(--card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                  color: "var(--secondary-foreground)",
                }}>
                  U
                </div>
                <span style={{ color: "var(--foreground)" }}>Usuario {memberId}</span>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: remainingSlots }).map((_, index) => (
              <div key={`empty-${index}`} style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                backgroundColor: "var(--card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                color: "var(--muted-foreground)",
              }}>
                {isOwner ? (
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--primary)",
                      padding: "0",
                      width: "100%",
                    }}
                  >
                    <UserPlus size={20} />
                    <span>Agregar Miembro</span>
                  </button>
                ) : (
                  <span>Posición Vacante</span>
                )}
              </div>
            ))}
          </div>

          {/* Leave team button for non-owners */}
          {!isOwner && team.members.includes("user1") && (
            <div style={{ marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
              <button
                onClick={handleLeaveTeam}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "var(--destructive)",
                  color: "var(--destructive-foreground)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <LogOut size={16} />
                Abandonar Equipo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 