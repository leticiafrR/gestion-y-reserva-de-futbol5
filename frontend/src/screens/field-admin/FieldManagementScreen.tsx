"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, MapPin, Users, DollarSign, X } from "lucide-react"
import { navigate } from "wouter/use-browser-location"
import { useGetOwnerFields, useCreateField } from "@/services/CreateFieldServices"
import type { Field } from "@/models/Field"
import { useQueryClient } from "@tanstack/react-query"
import { useDeleteField } from "@/services/CreateFieldServices";
import { useUpdateField } from "@/services/CreateFieldServices";


export const FieldManagementScreen = () => {
  const [activeTab, setActiveTab] = useState<"list" | "map">("list")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [fieldToDeleteId, setFieldToDeleteId] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const { data: fields = [], isLoading } = useGetOwnerFields()
  const createFieldMutation = useCreateField()

  const handleCreateField = async (fieldData: Omit<Field, "id" | "status" | "isAvailable">) => {
    try {
      await createFieldMutation.mutateAsync(fieldData)
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["owner-fields"] })
      setShowCreateModal(false)
    } catch (error) {
      console.error("Error creating field:", error)
      // Handle error (show toast, etc)
    }
  }

  const updateFieldMutation = useUpdateField();

  const handleEditField = async (fieldData: Omit<Field, "id">) => {
    if (!selectedField) return;
    try {
      await updateFieldMutation.mutateAsync({ id: selectedField.id, updates: fieldData });
      setShowEditModal(false);
      setSelectedField(null);
    } catch (error) {
      console.error("Error updating field:", error);
      // Handle error (show toast, etc)
    }
  };

  const deleteFieldMutation = useDeleteField();
  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteFieldMutation.mutateAsync(fieldId);
      setFieldToDeleteId(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting field:", error);
      // Handle error (show toast, etc)
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
              ⚽ Gestión de Canchas
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
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#212529", margin: 0 }}>{field.name}</h3>
                    <span
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#212529",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "500",
                      }}
                    >
                      Disponible
                    </span>
                  </div>

                  <p style={{ color: "#6c757d", fontSize: "14px", margin: "0 0 12px 0" }}>{field.address}</p>
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
                      <Users size={14} color="#6c757d" />
                      <span style={{ fontSize: "14px", color: "#495057" }}>{field.type}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <DollarSign size={14} color="#6c757d" />
                      <span style={{ fontSize: "14px", color: "#495057" }}>${field.pricePerHour}/hora</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={14} color="#6c757d" />
                      <span style={{ fontSize: "14px", color: "#495057" }}>
                        {field.grassType === "synthetic" ? "Sintético" : "Natural"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", color: "#495057" }}>
                        {field.isCovered ? "Techada" : "Al aire libre"}
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

            <div
              style={{
                backgroundColor: "#c8e6c9",
                borderRadius: "8px",
                height: "400px",
                position: "relative",
                border: "1px solid #a5d6a7",
              }}
            >
              {/* Simulated map pins */}
              <div
                style={{
                  position: "absolute",
                  top: "30%",
                  left: "25%",
                  backgroundColor: "white",
                  border: "2px solid #4caf50",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={12} color="#4caf50" />
                  <div>
                    <div style={{ color: "#212529" }}>Cancha Central</div>
                    <div style={{ color: "#6c757d", fontSize: "10px" }}>$80/hora</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "60%",
                  backgroundColor: "white",
                  border: "2px solid #4caf50",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={12} color="#4caf50" />
                  <div>
                    <div style={{ color: "#212529" }}>Cancha Norte</div>
                    <div style={{ color: "#6c757d", fontSize: "10px" }}>$50/hora</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  padding: "12px",
                  border: "1px solid #e9ecef",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <h4 style={{ fontSize: "12px", fontWeight: "bold", color: "#212529", margin: "0 0 8px 0" }}>Leyenda</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#4caf50",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <span style={{ fontSize: "11px", color: "#495057" }}>Cancha disponible</span>
                </div>
              </div>
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
  onSubmit: (field: Omit<Field, "id" | "status" | "isAvailable">) => void
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    pricePerHour: 0,
    capacity: 0,
    grassType: "synthetic" as "synthetic" | "natural",
    address: "",
    latitude: 0,
    longitude: 0,
    isCovered: false,
    hasLighting: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Nombre de la Cancha
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Cancha Principal"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Tipo de Cancha
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
              >
                <option value="">Selecciona el tipo</option>
                <option value="FUTBOL 11">Fútbol 11</option>
                <option value="FUTBOL 7">Fútbol 7</option>
                <option value="FUTBOL 5">Fútbol 5</option>
              </select>
            </div>
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
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
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
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                placeholder="50"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Capacidad (jugadores)
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                placeholder="22"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Tipo de Césped
              </label>
              <select
                value={formData.grassType}
                onChange={(e) => setFormData({ ...formData, grassType: e.target.value as "synthetic" | "natural" })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
              >
                <option value="synthetic">Sintético</option>
                <option value="natural">Natural</option>
              </select>
            </div>
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
              Dirección
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Av. Principal 123, Ciudad"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Latitud
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                placeholder="-34.6037"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Longitud
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                placeholder="-58.3816"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.isCovered}
                onChange={(e) => setFormData({ ...formData, isCovered: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Cancha techada</span>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              paddingLeft: "24px",
              paddingRight: "24px",
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
    type: field.type,
    description: field.description,
    pricePerHour: field.pricePerHour,
    capacity: field.capacity,
    grassType: field.grassType,
    address: field.address,
    latitude: field.latitude,
    longitude: field.longitude,
    isCovered: field.isCovered,
    isAvailable: field.isAvailable,
    status: field.status,
    hasLighting: field.hasLighting,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Nombre de la Cancha
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Tipo de Cancha
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
              >
                <option value="FUTBOL 11">Fútbol 11</option>
                <option value="FUTBOL 7">Fútbol 7</option>
                <option value="FUTBOL 5">Fútbol 5</option>
              </select>
            </div>
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
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
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
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Capacidad (jugadores)
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Tipo de Césped
              </label>
              <select
                value={formData.grassType}
                onChange={(e) => setFormData({ ...formData, grassType: e.target.value as "natural" | "synthetic" })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                }}
              >
                <option value="synthetic">Sintético</option>
                <option value="natural">Natural</option>
              </select>
            </div>
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
              Dirección
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Latitud
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#212529",
                  marginBottom: "6px",
                }}
              >
                Longitud
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ced4da",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.isCovered}
                onChange={(e) => setFormData({ ...formData, isCovered: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Cancha techada</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "14px", color: "#495057" }}>Disponible para reservas</span>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              paddingLeft: "24px",
              paddingRight: "24px",
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
