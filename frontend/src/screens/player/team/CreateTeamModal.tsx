import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { useCreateTeam } from "@/services/TeamServices";
import { uploadTeamLogo } from "@/services/supabaseClient";

interface CreateTeamModalProps {
  onClose: () => void;
  onError: (message: string) => void;
}

export const CreateTeamModal = ({ onClose, onError }: CreateTeamModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    primaryColor: "#ff0000",
    secondaryColor: "#ffffff"
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createTeamMutation = useCreateTeam();

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
    try {
      await createTeamMutation.mutateAsync(formData);
      onClose();
    } catch (error: any) {
      onError(error?.message || "Error al crear el equipo");
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
              disabled={createTeamMutation.isPending}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                opacity: createTeamMutation.isPending ? 0.7 : 1,
              }}
            >
              {createTeamMutation.isPending ? "Creando..." : "Crear Equipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 