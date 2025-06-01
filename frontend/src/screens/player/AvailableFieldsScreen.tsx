import { useAvailableFields } from "@/services/AvailableFieldsServices";
import type { Field } from "@/models/Field";
import { useState } from "react";
import { navigate } from "wouter/use-browser-location";
import { X } from "lucide-react";

export const AvailableFieldsScreen = () => {
  const { data: fields, isLoading, error } = useAvailableFields();
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  // Estados para los filtros
  const [search, setSearch] = useState("");
  const [grassType, setGrassType] = useState("");
  const [onlyWithLighting, setOnlyWithLighting] = useState(false);
  const [onlyRoofed, setOnlyRoofed] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(100);

  // Obtener tipos de césped únicos para el filtro
  const grassTypes = Array.from(new Set(fields?.map(f => f.grass) ?? []));

  // Obtener rango de precios para los límites del slider
  const prices = fields?.map(f => f.price ?? 0) ?? [];
  const maxAvailablePrice = prices.length > 0 ? Math.max(...prices) : 100;

  // Filtrado de canchas
  const filteredFields = (fields ?? []).filter((field: Field) => {
    const matchesName = field.name.toLowerCase().includes(search.toLowerCase());
    const matchesGrass = grassType ? field.grass === grassType : true;
    const matchesLighting = onlyWithLighting ? field.lighting : true;
    const matchesRoofed = onlyRoofed ? field.roofing : true;
    const fieldPrice = field.price ?? 0;
    const matchesMaxPrice = fieldPrice <= maxPrice;
    return matchesName && matchesGrass && matchesLighting && matchesRoofed && matchesMaxPrice;
  });

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando canchas...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--destructive)" }}>Error al cargar las canchas.</div>;

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: 1200, 
      margin: "0 auto",
      backgroundColor: "var(--background)",
      minHeight: "100vh"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem" 
      }}>
        <h1 style={{ color: "var(--foreground)", margin: 0, fontSize: "2rem" }}>Canchas Disponibles</h1>
        <button
          style={{
            padding: "10px 16px",
            backgroundColor: "var(--secondary)",
            color: "var(--secondary-foreground)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            fontSize: "14px",
            borderRadius: "var(--radius)",
            transition: "all 0.2s ease",
            textDecoration: "none"
          }}
          onClick={() => {
            navigate("/main");
          }}
        >
          Volver a Inicio
        </button>
      </div>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--card)",
          padding: "1.5rem 2rem",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 2px 8px var(--border)",
          border: "1px solid var(--border)"
        }}
      >
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            minWidth: 180
          }}
        />
        <select
          value={grassType}
          onChange={e => setGrassType(e.target.value)}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            minWidth: 180
          }}
        >
          <option value="">Todos los tipos de césped</option>
          {grassTypes.map(type => (
            <option key={type} value={type}>{type === "natural" ? "Natural" : "Sintético"}</option>
          ))}
        </select>
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: "0.5rem",
          minWidth: 200,
          width: "100%",
          maxWidth: 300
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "var(--foreground)",
            fontSize: "0.875rem"
          }}>
            <span>Precio máximo: ${maxPrice}</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(maxAvailablePrice, maxPrice)}
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            style={{
              width: "100%",
              appearance: "none",
              height: "6px",
              borderRadius: "var(--radius-sm)",
              background: "var(--muted)",
              outline: "none",
              accentColor: "var(--primary)",
              padding: 0,
              margin: 0
            }}
          />
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--muted-foreground)"
          }}>
            <span>$0</span>
            <span>${Math.max(maxAvailablePrice, maxPrice)}</span>
          </div>
        </div>
        <label style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          fontSize: "1rem",
          color: "var(--foreground)"
        }}>
          <input
            type="checkbox"
            checked={onlyWithLighting}
            onChange={e => setOnlyWithLighting(e.target.checked)}
            style={{ 
              width: 18, 
              height: 18,
              accentColor: "var(--primary)"
            }}
          />
          Solo con iluminación
        </label>
        <label style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          fontSize: "1rem",
          color: "var(--foreground)"
        }}>
          <input
            type="checkbox"
            checked={onlyRoofed}
            onChange={e => setOnlyRoofed(e.target.checked)}
            style={{ 
              width: 18, 
              height: 18,
              accentColor: "var(--primary)"
            }}
          />
          Solo techadas
        </label>
      </div>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        {filteredFields.length === 0 && (
          <div style={{ color: "var(--muted-foreground)", fontSize: "1.2rem" }}>No se encontraron canchas.</div>
        )}
        {filteredFields.map((field) => (
          <div
            key={field.id}
            onClick={() => setSelectedField(field)}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              width: "320px",
              background: "var(--card)",
              boxShadow: "0 2px 8px var(--border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px var(--border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 8px var(--border)";
            }}
          >
            <img
              src={field.photos[0]}
              alt={field.name}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "var(--radius)",
                marginBottom: "1rem",
                boxShadow: "0 1px 4px var(--border)"
              }}
            />
            <h2 style={{ margin: "0.5rem 0", color: "var(--primary)", fontSize: "1.5rem" }}>{field.name}</h2>
            <p style={{ margin: "0.2rem 0", color: "var(--foreground)" }}><b>Zona:</b> {field.area}</p>
            <p style={{ margin: "0.2rem 0", color: "var(--foreground)" }}><b>Césped:</b> {field.grass === "natural" ? "Natural" : "Sintético"}</p>
            <p style={{ margin: "0.2rem 0", color: "var(--foreground)" }}>
              <b>Iluminación:</b>{" "}
              <span style={{ color: field.lighting ? "var(--chart-2)" : "var(--destructive)", fontWeight: 600 }}>
                {field.lighting ? "Sí" : "No"}
              </span>
            </p>
            <p style={{ margin: "0.2rem 0", color: "var(--foreground)" }}>
              <b>Techada:</b>{" "}
              <span style={{ color: field.roofing ? "var(--chart-2)" : "var(--destructive)", fontWeight: 600 }}>
                {field.roofing ? "Sí" : "No"}
              </span>
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "1.5rem", color: "var(--primary)", fontWeight: "bold" }}>
              ${field.price}/hora
            </p>
          </div>
        ))}
      </div>

      {selectedField && (
        <FieldDetailsModal
          field={selectedField}
          onClose={() => setSelectedField(null)}
        />
      )}
    </div>
  );
};

const FieldDetailsModal = ({
  field,
  onClose,
}: {
  field: Field;
  onClose: () => void;
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
          backgroundColor: "var(--background)",
          borderRadius: "var(--radius-lg)",
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
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            backgroundColor: "var(--background)",
            zIndex: 1
          }}
        >
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "var(--foreground)", margin: "0 0 4px 0" }}>
              {field.name}
            </h2>
            <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "16px" }}>
              {field.area} - {field.location}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "var(--radius)",
              color: "var(--foreground)"
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Galería de fotos */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginTop: "16px",
              }}
            >
              {field.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${field.name} - Foto ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "var(--radius)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Información detallada */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "24px",
            marginBottom: "24px" 
          }}>
            <div>
              <h3 style={{ color: "var(--foreground)", fontSize: "18px", marginBottom: "16px" }}>Características</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ 
                  marginBottom: "12px", 
                  color: "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px" 
                }}>
                  <span style={{ fontWeight: "500" }}>Tipo de césped:</span>
                  {field.grass === "natural" ? "Natural" : "Sintético"}
                </li>
                <li style={{ 
                  marginBottom: "12px", 
                  color: "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px" 
                }}>
                  <span style={{ fontWeight: "500" }}>Iluminación:</span>
                  <span style={{ color: field.lighting ? "var(--chart-2)" : "var(--destructive)" }}>
                    {field.lighting ? "Sí" : "No"}
                  </span>
                </li>
                <li style={{ 
                  marginBottom: "12px", 
                  color: "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px" 
                }}>
                  <span style={{ fontWeight: "500" }}>Techada:</span>
                  <span style={{ color: field.roofing ? "var(--chart-2)" : "var(--destructive)" }}>
                    {field.roofing ? "Sí" : "No"}
                  </span>
                </li>
                <li style={{ 
                  marginBottom: "12px", 
                  color: "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px" 
                }}>
                  <span style={{ fontWeight: "500" }}>Precio:</span>
                  <span style={{ fontSize: "18px", color: "var(--primary)" }}>${field.price}/hora</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: "var(--foreground)", fontSize: "18px", marginBottom: "16px" }}>Ubicación</h3>
              <p style={{ color: "var(--foreground)", margin: "0 0 8px 0" }}>
                <span style={{ fontWeight: "500" }}>Dirección:</span> {field.location}
              </p>
              <p style={{ color: "var(--foreground)", margin: "0 0 8px 0" }}>
                <span style={{ fontWeight: "500" }}>Zona:</span> {field.area}
              </p>
            </div>
          </div>

          {field.description && (
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "var(--foreground)", fontSize: "18px", marginBottom: "16px" }}>Descripción</h3>
              <p style={{ color: "var(--foreground)", margin: 0, lineHeight: 1.6 }}>
                {field.description}
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div style={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            gap: "12px",
            borderTop: "1px solid var(--border)",
            paddingTop: "24px",
            position: "sticky",
            bottom: 0,
            backgroundColor: "var(--background)",
            zIndex: 1
          }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                // TODO: Implementar la lógica de reserva
                console.log("Reservar cancha:", field.id);
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Reservar Cancha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};