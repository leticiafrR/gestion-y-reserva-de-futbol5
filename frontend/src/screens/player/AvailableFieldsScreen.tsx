"use client"

import { useState, useEffect } from "react"
import { MapPin, List, Filter } from "lucide-react"
import { FieldsMap } from "@/components/FieldsMap/FieldsMap"
import type { Field } from "@/models/Field"
import { useAvailableFields } from "@/services/AvailableFieldsServices"
import { useUserProfile } from "@/services/UserServices"
import { FieldFilters } from "./FieldFilters"
import { FieldCard } from "./FieldCard"
import { FieldDetailsModal } from "./FieldDetailsModal"

export const AvailableFieldsScreen = () => {
  const { data: fields, isLoading, error } = useAvailableFields()
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const { data: userProfile } = useUserProfile()

  // Estados para los filtros
  const [search, setSearch] = useState("")
  const [zoneSearch, setZoneSearch] = useState("")
  const [grassType, setGrassType] = useState("")
  const [onlyWithLighting, setOnlyWithLighting] = useState(false)
  const [onlyRoofed, setOnlyRoofed] = useState(false)
  const [maxPrice, setMaxPrice] = useState<number>(100)
  const [filtersExpanded, setFiltersExpanded] = useState(true)

  useEffect(() => {
    if (userProfile?.zone) {
      setZoneSearch(userProfile.zone)
    }
  }, [userProfile])

  // Filtrado de canchas
  const filteredFields = (fields ?? []).filter((field: Field) => {
    const matchesName = field.name.toLowerCase().includes(search.toLowerCase())
    const matchesZone = zoneSearch ? field.zone === zoneSearch : true
    const matchesGrass = grassType ? field.grassType === grassType : true
    const matchesLighting = onlyWithLighting ? field.lighting : true
    const matchesRoofed = onlyRoofed ? field.roofing : true
    const fieldPrice = field.price ?? 0
    const matchesMaxPrice = fieldPrice <= maxPrice
    return matchesName && matchesZone && matchesGrass && matchesLighting && matchesRoofed && matchesMaxPrice
  })

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando canchas...</div>
  if (error) return <div style={{ textAlign: "center", marginTop: "2rem", color: "#ef4444" }}>Error al cargar las canchas.</div>

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: 1200,
        margin: "0 auto"
      }}
    >
      {/* Header */}
      <header
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          boxShadow: "0 1px 3px var(--border)",
          marginBottom: "32px"
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "var(--foreground)", margin: 0 }}>
            ⚽ Canchas Disponibles
          </h1>
          <p style={{ color: "var(--muted-foreground)", margin: "4px 0 0 0", fontSize: "14px" }}>
            Reservá tu cancha favorita
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* Toggle Filtros */}
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            style={{
              padding: "10px 16px",
              backgroundColor: filtersExpanded ? "#3b82f6" : "white",
              color: filtersExpanded ? "white" : "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
          >
            <Filter size={16} />
            {filtersExpanded ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>

          {/* Toggle Vista */}
          <div
            style={{
              display: "flex",
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "10px 16px",
                backgroundColor: viewMode === "list" ? "#3b82f6" : "transparent",
                color: viewMode === "list" ? "white" : "#374151",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
            >
              <List size={16} />
              Lista
            </button>
            <button
              onClick={() => setViewMode("map")}
              style={{
                padding: "10px 16px",
                backgroundColor: viewMode === "map" ? "#3b82f6" : "transparent",
                color: viewMode === "map" ? "white" : "#374151",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
            >
              <MapPin size={16} />
              Mapa
            </button>
          </div>

          {/* Botón Volver */}
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--secondary)",
              border: "1px solid transparent",
              borderRadius: "8px",
              color: "var(--secondary-foreground)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "var(--accent)";
              e.currentTarget.style.borderColor = "black";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "var(--secondary)";
              e.currentTarget.style.borderColor = "transparent";
            }}
            onClick={() => {
              window.location.href = "/main"
            }}
          >
            Volver a Inicio
          </button>
        </div>
      </header>

      {/* Filtros */}
      <FieldFilters
        search={search}
        setSearch={setSearch}
        zoneSearch={zoneSearch}
        setZoneSearch={setZoneSearch}
        grassType={grassType}
        setGrassType={setGrassType}
        onlyWithLighting={onlyWithLighting}
        setOnlyWithLighting={setOnlyWithLighting}
        onlyRoofed={onlyRoofed}
        setOnlyRoofed={setOnlyRoofed}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        filtersExpanded={filtersExpanded}
        setFiltersExpanded={setFiltersExpanded}
        fields={fields}
        filteredFields={filteredFields}
      />

      {/* Main Content */}
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 16px"
      }}>
        <div style={{
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px var(--border)"
        }}>
          {viewMode === "map" ? (
            <FieldsMap fields={filteredFields} onFieldSelect={(field) => setSelectedField(field)} />
          ) : (
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
              {filteredFields.length === 0 && (
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "1.2rem",
                    textAlign: "center",
                    padding: "40px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    width: "100%",
                  }}
                >
                  No se encontraron canchas que coincidan con los filtros seleccionados.
                </div>
              )}
              {filteredFields.map((field) => (
                <FieldCard key={field.id} field={field} onClick={setSelectedField} />
              ))}
            </div>
          )}
        </div>
      </main>
      {selectedField && (
        <FieldDetailsModal field={selectedField} onClose={() => setSelectedField(null)} />
      )}
    </div>
  )
}