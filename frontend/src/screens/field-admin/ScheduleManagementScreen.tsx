"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { ScheduleConfiguration } from "@/components/ScheduleConfiguration/ScheduleConfiguration"

interface Field {
  id: string
  name: string
  type: string
}

export const ScheduleManagementScreen = () => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>("1")

  const fields: Field[] = [
    { id: "1", name: "Cancha Central", type: "FUTBOL 11" },
    { id: "2", name: "Cancha Norte", type: "FUTBOL 7" },
    { id: "3", name: "Cancha Sur", type: "FUTBOL 5" },
  ]

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
              ⏰ Gestión de Horarios
            </h1>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
              Configura horarios y gestiona franjas horarias de las canchas
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              backgroundColor: "transparent",
              color: "#6c757d",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              textDecoration: "underline",
            }}
          >
            <ArrowLeft size={16} />
            Volver a Inicio
          </button>
        </div>
      </div>

      <ScheduleConfiguration fields={fields} selectedFieldId={selectedFieldId} onFieldChange={setSelectedFieldId} />
    </div>
  )
}
