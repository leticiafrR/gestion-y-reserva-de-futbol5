"use client"

import type React from "react"

import { useState, useRef } from "react"
  // @ts-expect-error 
import { Plus, Edit, Trash2, MapPin, Users, DollarSign, X } from "lucide-react"
import { navigate } from "wouter/use-browser-location"
import { useGetOwnerFields, useCreateField } from "@/services/CreateFieldServices"
import type { Field } from "@/models/Field"
import { useQueryClient } from "@tanstack/react-query"
import { useDeleteField } from "@/services/CreateFieldServices";
import { useUpdateField } from "@/services/CreateFieldServices";
import { FieldsMap } from "@/components/FieldsMap/FieldsMap";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";


export const FieldManagementScreen = () => {
  const [activeTab, setActiveTab] = useState<"list" | "map">("list")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fieldToDeleteId, setFieldToDeleteId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const queryClient = useQueryClient()
  const { data: fields = [], isLoading } = useGetOwnerFields()
  const createFieldMutation = useCreateField()

  console.log("fields", fields);

  const handleCreateField = async (fieldData: Omit<Field, "id" | "status" | "isAvailable">) => {
    try {
      await createFieldMutation.mutateAsync(fieldData)
      queryClient.invalidateQueries({ queryKey: ["owner-fields"] })
      setErrorMessage(null)
      setShowCreateModal(false)
    } catch (error: any) {
      console.error("Error creating field:", error)
      setErrorMessage(error.message || "Error al crear la cancha")
    }
  }

  const updateFieldMutation = useUpdateField();

  const handleEditField = async (fieldData: Omit<Field, "id">) => {
    if (!selectedField) return;
    try {
      await updateFieldMutation.mutateAsync({ id: selectedField.id, updates: fieldData });
      setErrorMessage(null)
      setShowEditModal(false);
      setSelectedField(null);
    } catch (error: any) {
      console.error("Error updating field:", error);
      setErrorMessage(error.message || "Error al actualizar la cancha");
    }
  };

  const deleteFieldMutation = useDeleteField();
  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteFieldMutation.mutateAsync(fieldId);
      queryClient.invalidateQueries({ queryKey: ["owner-fields"] });
      setFieldToDeleteId(null);
      setShowDeleteModal(false);
      setSuccessMessage("Cancha eliminada correctamente");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting field:", error);
      setErrorMessage("Error al eliminar la cancha");
    }
  };

  console.log("FieldManagementScreen mounted")

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {successMessage && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e9ecef",
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#212529",
                margin: "0 0 4px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ⚽ Gestión de Canchas de Fútbol 5
            </h1>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>Administra tus canchas de fútbol</p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                backgroundColor: "#212529",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <Plus size={16} />
              Nueva Cancha
            </button>
            <button
              style={{
                padding: "10px 16px",
                backgroundColor: "transparent",
                color: "#6c757d",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "underline",
              }}
              onClick={() => {
                navigate("/main")
              }}
            >
              Volver a Inicio
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            padding: "4px",
            marginBottom: "24px",
            border: "1px solid #e9ecef",
          }}
        >
          <button
            onClick={() => setActiveTab("list")}
            style={{
              flex: 1,
              padding: "12px 24px",
              backgroundColor: activeTab === "list" ? "white" : "transparent",
              color: activeTab === "list" ? "#212529" : "#6c757d",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: activeTab === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Lista de Canchas
          </button>
          <button
            onClick={() => setActiveTab("map")}
            style={{
              flex: 1,
              padding: "12px 24px",
              backgroundColor: activeTab === "map" ? "white" : "transparent",
              color: activeTab === "map" ? "#212529" : "#6c757d",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: activeTab === "map" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Mapa de Canchas
          </button>
        </div>

        {/* Content */}
        {activeTab === "list" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
              gap: "20px",
            }}
          >
            {isLoading ? (
              <div>Cargando canchas...</div>
            ) : fields.length === 0 ? (
              <div>No hay canchas registradas</div>
            ) : (
              fields.map((field) => (
                <div
                  key={field.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e9ecef",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onClick={() => {
                    setSelectedField(field)
                    setShowDetailsModal(true)
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"
                    e.currentTarget.style.transform = "translateY(-4px)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"
                    e.currentTarget.style.transform = "none"
                  }}
                >
                  <img
                    src={field.photoUrl || "/placeholder.svg"}
                    alt={field.name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#212529", margin: 0 }}>{field.name}</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          backgroundColor: field.active ? "#10b981" : "#ef4444",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "500",
                        }}
                      >
                        {field.active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: "#6c757d", fontSize: "14px", margin: "0 0 12px 0" }}>{field.location.address}</p>
                  <p style={{ color: "#495057", fontSize: "14px", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                    {field.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={14} color="#6c757d" />
                      <span style={{ fontSize: "14px", color: "#495057" }}>
                        {field.grassType === "sintetico" ? "Sintético" : "Natural"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <DollarSign size={14} color="#6c757d" />
                      <span style={{ fontSize: "14px", color: "#495057" }}>${field.price}/hora</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", color: "#495057" }}>
                        {field.lighting ? "Con iluminación" : "Sin iluminación"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", color: "#495057" }}>
                        {field.roofing ? "Techada" : "Al aire libre"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        setSelectedField(field)
                        setShowEditModal(true)
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "8px 12px",
                        backgroundColor: "transparent",
                        color: "#495057",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <Edit size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setFieldToDeleteId(field.id)
                        setShowDeleteModal(true)
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "8px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#212529", marginBottom: "8px" }}>
              Mapa de Canchas
            </h2>
            <p style={{ color: "#6c757d", fontSize: "14px", marginBottom: "20px" }}>
              Ubicación de todas las canchas registradas
            </p>
            <div style={{ marginBottom: 32 }}>
              <FieldsMap fields={fields} />
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && <CreateFieldModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateField} />}

        {/* Edit Modal */}
        {showEditModal && selectedField && (
          <EditFieldModal
            field={selectedField}
            onClose={() => {
              setShowEditModal(false)
              setSelectedField(null)
            }}
            onSubmit={handleEditField}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && fieldToDeleteId && (
          <DeleteConfirmationModal
            fieldId={fieldToDeleteId}
            fieldName={fields.find(f => f.id === fieldToDeleteId)?.name || 'this field'}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteField}
          />
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedField && (
          <FieldDetailsModalAdmin
            field={selectedField}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
      </div>
    </div>
  )
}

// Create Field Modal Component
const CreateFieldModal = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (field: Omit<Field, "id">) => void
}) => {
  const [formData, setFormData] = useState({
    name: "",
    grassType: "sintetico" as "natural" | "sintetico",
    lighting: false,
    roofing: false,
    location: {
      address: "",
      lat: -34.6037, // Default to Buenos Aires
      lng: -58.3816,
    },
    zone: "",
    photoUrl: "",
    description: "",
    price: 0,
  })

  const [error, setError] = useState<string | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAV-7--jx2dP-MyDxVrhcSYlNnY8KNb8g8",
    libraries: ["places"],
  });

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        // Get the neighborhood or locality from address components
        let zone = "";
        if (place.address_components) {
          const neighborhood = place.address_components.find(
            component => component.types.includes("neighborhood")
          );
          const locality = place.address_components.find(
            component => component.types.includes("locality")
          );
          zone = neighborhood?.long_name || locality?.long_name || "";
        }

        setFormData(prev => ({
          ...prev,
          location: {
            address: place.formatted_address || prev.location.address,
            lat: place.geometry?.location?.lat() || prev.location.lat,
            lng: place.geometry?.location?.lng() || prev.location.lng,
          },
          zone: zone || prev.zone
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const fieldData = {
        ...formData,
        address: formData.location.address,
        location: formData.location
      };
      await onSubmit(fieldData)
    } catch (err: any) {
      setError(err.message || "Error al crear la cancha")
    }
  }

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
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#212529", margin: "0 0 4px 0" }}>
              Nueva Cancha
            </h2>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
              Completa la información para crear una nueva cancha
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
            <X size={20} color="#6c757d" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {error && (
            <div
              style={{
                backgroundColor: "#fff5f5",
                color: "#dc3545",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Nombre de la Cancha *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setError(null)
                setFormData({ ...formData, name: e.target.value })
              }}
              placeholder="Ej: Cancha Principal"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Tipo de Césped *
            </label>
            <select
              value={formData.grassType}
              onChange={(e) => setFormData({ ...formData, grassType: e.target.value as "natural" | "sintetico" })}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            >
              <option value="sintetico">Sintético</option>
              <option value="natural">Natural</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Ubicación *
            </label>
            {isLoaded ? (
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                restrictions={{ country: "ar" }}
              >
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  placeholder="Ej: Av. Principal 123"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ced4da",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    color: "#212529",
                  }}
                />
              </Autocomplete>
            ) : (
              <div>Cargando...</div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Zona *
            </label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              placeholder="Ej: Centro"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Precio por Hora ($)
            </label>
            <input
              type="number"
              min="1"
              value={formData.price}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 0) {
                  setFormData({ ...formData, price: value });
                }
              }}
              placeholder="50"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe las características de la cancha"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                resize: "vertical",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.lighting}
                onChange={(e) => setFormData({ ...formData, lighting: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Tiene iluminación</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.roofing}
                onChange={(e) => setFormData({ ...formData, roofing: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Cancha techada</span>
            </label>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              URL de Foto (opcional)
            </label>
            <textarea
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="Ingrese URL de la foto"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                resize: "vertical",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "#6c757d",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#212529",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Crear Cancha
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Field Modal Component
const EditFieldModal = ({
  field,
  onClose,
  onSubmit,
}: {
  field: Field
  onClose: () => void
  onSubmit: (field: Omit<Field, "id">) => void
}) => {
  const [formData, setFormData] = useState({
    name: field.name,
    grassType: field.grassType,
    lighting: field.lighting,
    roofing: field.roofing,
    location: {
      address: field.location.address,
      lat: field.location.lat,
      lng: field.location.lng,
    },
    zone: field.zone,
    photoUrl: field.photoUrl || "",
    description: field.description || "",
    price: field.price || 0,
  })

  const [error, setError] = useState<string | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAV-7--jx2dP-MyDxVrhcSYlNnY8KNb8g8",
    libraries: ["places"],
  });

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        // Get the neighborhood or locality from address components
        let zone = "";
        if (place.address_components) {
          const neighborhood = place.address_components.find(
            component => component.types.includes("neighborhood")
          );
          const locality = place.address_components.find(
            component => component.types.includes("locality")
          );
          zone = neighborhood?.long_name || locality?.long_name || "";
        }

        setFormData(prev => ({
          ...prev,
          location: {
            address: place.formatted_address || prev.location.address,
            lat: place.geometry?.location?.lat() || prev.location.lat,
            lng: place.geometry?.location?.lng() || prev.location.lng,
          },
          zone: zone || prev.zone
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const fieldData = {
        ...formData,
        address: formData.location.address,
        location: formData.location
      };
      await onSubmit(fieldData)
    } catch (err: any) {
      setError(err.message || "Error al actualizar la cancha")
    }
  }

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
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#212529", margin: "0 0 4px 0" }}>
              Editar Cancha
            </h2>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>Modifica los datos de la cancha</p>
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
            <X size={20} color="#6c757d" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {error && (
            <div
              style={{
                backgroundColor: "#fff5f5",
                color: "#dc3545",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Nombre de la Cancha *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setError(null)
                setFormData({ ...formData, name: e.target.value })
              }}
              placeholder="Ej: Cancha Principal"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Tipo de Césped *
            </label>
            <select
              value={formData.grassType}
              onChange={(e) => setFormData({ ...formData, grassType: e.target.value as "natural" | "sintetico" })}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            >
              <option value="sintetico">Sintético</option>
              <option value="natural">Natural</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Ubicación *
            </label>
            {isLoaded ? (
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                restrictions={{ country: "ar" }}
              >
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  placeholder="Ej: Av. Principal 123"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ced4da",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    color: "#212529",
                  }}
                />
              </Autocomplete>
            ) : (
              <div>Cargando...</div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Zona *
            </label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              placeholder="Ej: Centro"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Precio por Hora ($)
            </label>
            <input
              type="number"
              min="1"
              value={formData.price}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value > 0) {
                  setFormData({ ...formData, price: value });
                }
              }}
              placeholder="50"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe las características de la cancha"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                resize: "vertical",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.lighting}
                onChange={(e) => setFormData({ ...formData, lighting: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Tiene iluminación</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.roofing}
                onChange={(e) => setFormData({ ...formData, roofing: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Cancha techada</span>
            </label>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#212529",
                marginBottom: "6px",
              }}
            >
              URL de Foto (opcional)
            </label>
            <textarea
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="Ingrese URL de la foto"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                resize: "vertical",
                backgroundColor: "white",
                color: "#212529",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "#6c757d",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#212529",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Actualizar Cancha
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
const DeleteConfirmationModal = ({
  fieldId,
  fieldName,
  onClose,
  onConfirm,
}: {
  fieldId: string
  fieldName: string
  onClose: () => void
  onConfirm: (fieldId: string) => void
}) => {
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
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#212529", margin: "0 0 4px 0" }}>
              Confirmar Eliminación
            </h2>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
              ¿Estás seguro de que quieres eliminar la cancha "{fieldName}"?
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
            <X size={20} color="#6c757d" />
          </button>
        </div>

        {/* Main content area */}
        <div style={{ padding: "0 24px 24px 24px" }}>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              paddingLeft: "0",
              paddingRight: "0",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "#6c757d",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(fieldId)
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this component at the end of the file
const ErrorPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#dc3545",
        color: "white",
        padding: "16px 24px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "400px",
      }}
    >
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "4px",
        }}
      >
        <X size={20} />
      </button>
    </div>
  );
};

const SuccessPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#28a745",
        color: "white",
        padding: "16px 24px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "400px",
      }}
    >
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "4px",
        }}
      >
        <X size={20} />
      </button>
    </div>
  );
};

const FieldDetailsModalAdmin = ({ field, onClose }: { field: Field; onClose: () => void }) => {
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
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937", margin: "0 0 4px 0" }}>
              {field.name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ 
                padding: "6px 12px", 
                backgroundColor: field.active ? "#10b981" : "#ef4444", 
                color: "white", 
                borderRadius: "4px", 
                fontSize: "14px", 
                fontWeight: "600" 
              }}>
                {field.active ? "Cancha Activa" : "Cancha Inactiva"}
              </span>
            </div>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "16px" }}>
              {field.zone} - {field.location.address}
            </p>
          </div>
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

        <div style={{ padding: "24px" }}>
          {/* Imagen */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginTop: "16px",
              }}
            >
              <img
                src={field.photoUrl || "/placeholder.svg"}
                alt={`${field.name} - Foto`}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>

          {/* Información detallada */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "24px",
              marginBottom: "24px",
            }}
          >
            <div>
              <h3 style={{ color: "#1f2937", fontSize: "18px", marginBottom: "16px" }}>Características</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li
                  style={{
                    marginBottom: "12px",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>Tipo de césped:</span>
                  {field.grassType === "natural" ? "Natural" : "Sintético"}
                </li>
                <li
                  style={{
                    marginBottom: "12px",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>Iluminación:</span>
                  <span style={{ color: field.lighting ? "#10b981" : "#ef4444" }}>{field.lighting ? "Sí" : "No"}</span>
                </li>
                <li
                  style={{
                    marginBottom: "12px",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>Techada:</span>
                  <span style={{ color: field.roofing ? "#10b981" : "#ef4444" }}>{field.roofing ? "Sí" : "No"}</span>
                </li>
                <li
                  style={{
                    marginBottom: "12px",
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>Precio:</span>
                  <span style={{ fontSize: "18px", color: "#3b82f6" }}>${field.price}/hora</span>
                </li>
              </ul>
              <FieldScheduleView schedule={field.schedule || []} />
            </div>

            <div>
              <h3 style={{ color: "#1f2937", fontSize: "18px", marginBottom: "16px" }}>Ubicación</h3>
              <p style={{ color: "#374151", margin: "0 0 8px 0" }}>
                <span style={{ fontWeight: "500" }}>Dirección:</span> {field.location.address}
              </p>
              <p style={{ color: "#374151", margin: "0 0 8px 0" }}>
                <span style={{ fontWeight: "500" }}>Zona:</span> {field.zone}
              </p>
            </div>
          </div>

          {field.description && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "#1f2937", fontSize: "18px", marginBottom: "16px" }}>Descripción</h3>
              <p style={{ color: "#374151", margin: 0, lineHeight: 1.6 }}>{field.description}</p>
            </div>
          )}

          {/* Botón de cerrar */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "24px",
              position: "sticky",
              bottom: 0,
              backgroundColor: "white",
              zIndex: 1,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const daysMap = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo"
};

const allDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

const FieldScheduleView = ({ schedule }: { schedule: { dayOfWeek: string; openTime: string; closeTime: string }[] }) => {
  return (
    <div style={{ marginTop: 24 }}>
      <h4 style={{ color: "#1f2937", fontSize: 16, marginBottom: 8 }}>Horarios Disponibles</h4>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <tbody>
          {allDays.map(day => {
            const found = schedule.find(s => s.dayOfWeek === day);
            return (
              <tr key={day}>
                <td style={{ padding: "4px 8px", color: "#374151", fontWeight: 500 }}>{daysMap[day as keyof typeof daysMap]}</td>
                <td style={{ padding: "4px 8px", color: found ? "#10b981" : "#ef4444" }}>
                  {found ? `${found.openTime} - ${found.closeTime}` : "Cerrado"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
