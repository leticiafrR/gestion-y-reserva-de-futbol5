import React from "react";
import { X } from "lucide-react";
import type { Field } from "@/models/Field";
import { useFieldAvailability } from "@/services/fieldAvailabilityService";

const FieldScheduleView = ({ fieldId }: { fieldId: string | number }) => {
  const { data: slots, isLoading, error } = useFieldAvailability(Number(fieldId));

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

  return (
    <div style={{ marginTop: 24 }}>
      <h4 style={{ color: "#1f2937", fontSize: 16, marginBottom: 8 }}>Horarios Disponibles</h4>
      {isLoading ? (
        <div style={{ color: "#6c757d" }}>Cargando horarios...</div>
      ) : error ? (
        <div style={{ color: "#ef4444" }}>Error al cargar horarios</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {allDays.map(day => {
              const found = (slots || []).find((s: any) => s.dayOfWeek === day);
              return (
                <tr key={day}>
                  <td style={{ padding: "4px 8px", color: "#374151", fontWeight: 500 }}>{daysMap[day as keyof typeof daysMap]}</td>
                  <td style={{ padding: "4px 8px", color: found ? "#10b981" : "#ef4444" }}>
                    {found ? `${found.openTime}:00 - ${found.closeTime}:00` : "Cerrado"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const FieldDetailsModalAdmin = ({ field, onClose }: { field: Field; onClose: () => void }) => {
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
              {field.zone} - {field.address}
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
              <FieldScheduleView fieldId={field.id} />
            </div>

            <div>
              <h3 style={{ color: "#1f2937", fontSize: "18px", marginBottom: "16px" }}>Ubicación</h3>
              <p style={{ color: "#374151", margin: "0 0 8px 0" }}>
                <span style={{ fontWeight: "500" }}>Dirección:</span> {field.address}
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
  );
}; 