import type { Field } from "@/models/Field"

interface FieldCardProps {
  field: Field
  onClick: (field: Field) => void
}

export const FieldCard = ({ field, onClick }: FieldCardProps) => {
  return (
    <div
      onClick={() => onClick(field)}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "1.5rem",
        width: "320px",
        background: field.active ? "white" : "#f8f9fa",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        opacity: field.active ? 1 : 0.8,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.boxShadow = "0 10px 25px -3px rgba(0, 0, 0, 0.1)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none"
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}
    >
      {!field.active && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <span style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "500",
          }}>
            Cancha Inactiva
          </span>
        </div>
      )}
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
      <h2 style={{ margin: "0.5rem 0", color: "#3b82f6", fontSize: "1.5rem", fontWeight: "600" }}>
        {field.name}
      </h2>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        marginBottom: "0.5rem" 
      }}>
        <span style={{ 
          padding: "4px 8px", 
          backgroundColor: field.active ? "#10b981" : "#ef4444", 
          color: "white", 
          borderRadius: "4px", 
          fontSize: "12px", 
          fontWeight: "500" 
        }}>
          {field.active ? "Activa" : "Inactiva"}
        </span>
      </div>
      <p style={{ margin: "0.2rem 0", color: "#374151" }}>
        <b>Zona:</b> {field.zone}
      </p>
      <p style={{ margin: "0.2rem 0", color: "#374151" }}>
        <b>Césped:</b> {field.grassType === "natural" ? "Natural" : "Sintético"}
      </p>
      <p style={{ margin: "0.2rem 0", color: "#374151" }}>
        <b>Iluminación:</b>{" "}
        <span style={{ color: field.lighting ? "#10b981" : "#ef4444", fontWeight: 600 }}>
          {field.lighting ? "Sí" : "No"}
        </span>
      </p>
      <p style={{ margin: "0.2rem 0", color: "#374151" }}>
        <b>Techada:</b>{" "}
        <span style={{ color: field.roofing ? "#10b981" : "#ef4444", fontWeight: 600 }}>
          {field.roofing ? "Sí" : "No"}
        </span>
      </p>
      <p style={{ margin: "0.5rem 0", fontSize: "1.5rem", color: "#3b82f6", fontWeight: "bold" }}>
        ${field.price}/hora
      </p>
    </div>
  )
} 