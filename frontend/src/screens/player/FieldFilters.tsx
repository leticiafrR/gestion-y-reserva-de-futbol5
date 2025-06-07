// @ts-expect-error 
import { Search, Filter, Sliders } from "lucide-react"
import type { Field } from "@/models/Field"

interface FieldFiltersProps {
  search: string
  setSearch: (value: string) => void
  zoneSearch: string
  setZoneSearch: (value: string) => void
  grassType: string
  setGrassType: (value: string) => void
  onlyWithLighting: boolean
  setOnlyWithLighting: (value: boolean) => void
  onlyRoofed: boolean
  setOnlyRoofed: (value: boolean) => void
  maxPrice: number
  setMaxPrice: (value: number) => void
  filtersExpanded: boolean
  setFiltersExpanded: (value: boolean) => void
  fields: Field[] | undefined
  filteredFields: Field[]
}

export const FieldFilters = ({
  search,
  setSearch,
  zoneSearch,
  setZoneSearch,
  grassType,
  setGrassType,
  onlyWithLighting,
  setOnlyWithLighting,
  onlyRoofed,
  setOnlyRoofed,
  maxPrice,
  setMaxPrice,
  filtersExpanded,
  // @ts-expect-error 
  setFiltersExpanded,
  fields,
  filteredFields,
}: FieldFiltersProps) => {
  // Obtener tipos de césped únicos para el filtro
  const grassTypes = Array.from(new Set(fields?.map((f) => f.grassType) ?? []))
  // Obtener zonas únicas para el filtro
  const zones = Array.from(new Set(fields?.map((f) => f.zone) ?? []))

  // Obtener rango de precios para los límites del slider
  const prices = fields?.map((f) => f.price ?? 0) ?? []
  const maxAvailablePrice = prices.length > 0 ? Math.max(...prices) : 100

  return (
    <div
      style={{
        marginBottom: "2rem",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        maxHeight: filtersExpanded ? "1000px" : "0",
        opacity: filtersExpanded ? 1 : 0,
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div style={{ padding: filtersExpanded ? "24px" : "0" }}>
        {/* Header de Filtros */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <Sliders size={20} color="#3b82f6" />
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>Filtros de Búsqueda</h3>
        </div>

        {/* Filtros Principales */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          {/* Búsqueda por Nombre */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Buscar por nombre
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                placeholder="Ej: Cancha Central..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#f9fafb",
                  color: "#1f2937",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6"
                  e.target.style.backgroundColor = "white"
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db"
                  e.target.style.backgroundColor = "#f9fafb"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>
          </div>

          {/* Filtro por Zona */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Zona
            </label>
            <select
              value={zoneSearch}
              onChange={(e) => setZoneSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#f9fafb",
                color: "#1f2937",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6"
                e.target.style.backgroundColor = "white"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db"
                e.target.style.backgroundColor = "#f9fafb"
              }}
            >
              <option value="">Todas las zonas</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <div style={{ 
              fontSize: "0.8rem", 
              color: "#6b7280",
              marginTop: "4px"
            }}>
              Solo se muestran las zonas que tienen canchas disponibles
            </div>
          </div>

          {/* Tipo de Césped */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Tipo de césped
            </label>
            <select
              value={grassType}
              onChange={(e) => setGrassType(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#f9fafb",
                color: "#1f2937",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6"
                e.target.style.backgroundColor = "white"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db"
                e.target.style.backgroundColor = "#f9fafb"
              }}
            >
              <option value="">Todos los tipos</option>
              {grassTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "natural" ? "Natural" : "Sintético"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtro de Precio */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "12px",
            }}
          >
            Precio máximo por hora
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#6b7280", minWidth: "30px" }}>$0</span>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="range"
                min={0}
                max={Math.max(maxAvailablePrice, maxPrice)}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "3px",
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    (maxPrice / Math.max(maxAvailablePrice, maxPrice)) * 100
                  }%, #e5e7eb ${(maxPrice / Math.max(maxAvailablePrice, maxPrice)) * 100}%, #e5e7eb 100%)`,
                  outline: "none",
                  appearance: "none",
                  cursor: "pointer",
                }}
              />
            </div>
            <span style={{ fontSize: "14px", color: "#6b7280", minWidth: "50px" }}>
              ${Math.max(maxAvailablePrice, maxPrice)}
            </span>
            <div
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                minWidth: "80px",
                textAlign: "center",
              }}
            >
              ${maxPrice}
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: onlyWithLighting ? "#eff6ff" : "#f9fafb",
              border: `1px solid ${onlyWithLighting ? "#3b82f6" : "#e5e7eb"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <input
              type="checkbox"
              checked={onlyWithLighting}
              onChange={(e) => setOnlyWithLighting(e.target.checked)}
              style={{
                width: 18,
                height: 18,
                accentColor: "#3b82f6",
              }}
            />
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Con iluminación</span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: onlyRoofed ? "#eff6ff" : "#f9fafb",
              border: `1px solid ${onlyRoofed ? "#3b82f6" : "#e5e7eb"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <input
              type="checkbox"
              checked={onlyRoofed}
              onChange={(e) => setOnlyRoofed(e.target.checked)}
              style={{
                width: 18,
                height: 18,
                accentColor: "#3b82f6",
              }}
            />
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Techadas</span>
          </label>
        </div>

        {/* Información de resultados */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px 16px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
            }}
          ></div>
          <span style={{ fontSize: "14px", color: "#1e40af" }}>
            Se encontraron <strong>{filteredFields.length}</strong> canchas que coinciden con tus filtros
          </span>
        </div>
      </div>
    </div>
  )
} 