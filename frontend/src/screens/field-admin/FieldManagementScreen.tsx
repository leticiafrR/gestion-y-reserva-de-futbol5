"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Plus, Edit, Trash2, MapPin, DollarSign } from "lucide-react"
import { navigate } from "wouter/use-browser-location"
import { useGetOwnerFields, useCreateField, useUpdateFieldActiveStatus } from "@/services/CreateFieldServices"
import type { Field } from "@/models/Field"
import { useQueryClient } from "@tanstack/react-query"
import { useDeleteField } from "@/services/CreateFieldServices";
import { useUpdateField } from "@/services/CreateFieldServices";
import { FieldsMap } from "@/components/FieldsMap/FieldsMap";
import { CreateFieldModal } from "@/components/ConfirmationModal/CreateFildModal"
import { EditFieldModal } from "@/components/ConfirmationModal/EditFieldModal"
import { FieldDetailsModalAdmin } from "@/components/ConfirmationModal/FieldDetailsModalAdmin"
import { ErrorPopup } from "@/components/ConfirmationModal/ErrorPopup"
import { SuccessPopup } from "@/components/ConfirmationModal/SuccessPopup"
import { DeleteConfirmationModal } from "@/components/ConfirmationModal/DeleteConfirmationModal"


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
  const updateFieldActiveStatusMutation = useUpdateFieldActiveStatus();

  const handleEditField = async (fieldData: Omit<Field, "id">) => {
    if (!selectedField) return;
    try {
      // Primero actualizamos el estado activo/inactivo
      await updateFieldActiveStatusMutation.mutateAsync({ 
        id: Number(selectedField.id), 
        active: fieldData.active 
      });
      
      // Luego actualizamos el resto de los datos
      await updateFieldMutation.mutateAsync({ 
        id: selectedField.id, 
        updates: fieldData 
      });
      
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
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('button')) {
                      setSelectedField(field)
                      setShowDetailsModal(true)
                    }
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

