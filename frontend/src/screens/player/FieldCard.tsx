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
        background: "white",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
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
      <img
        src={field.photos[0] || "/placeholder.svg"}
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
      <p style={{ margin: "0.2rem 0", color: "#374151" }}>
        <b>Zona:</b> {field.area}
      </p>
      <p style={{ margin: "0.2rem 0", color: "#374151" }}>
        <b>Césped:</b> {field.grass === "natural" ? "Natural" : "Sintético"}
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